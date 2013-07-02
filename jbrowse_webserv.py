__author__ = 'urvishparikh'
from flask import Flask, request
import json
import os, sys
import logging
import psycopg2


sys.path.append(os.path.join(os.path.dirname(__file__), "../grit/file_types"))
from gtf_file import Gene, Transcript

sys.path.append(os.path.join(os.path.dirname(__file__), "../grit/postgres_interface"))
from load_gene_from_db import parse_contig_composite, parse_integer_range
cds_exons = []



def load_transcript_ids( gene, conn ):
    cursor = conn.cursor()
    query = "SELECT id FROM annotations.transcripts WHERE gene = %s;"
    cursor.execute( query, (gene.id,) )
    rv = [ x[0] for x in cursor.fetchall() ]
    cursor.close()
    return rv

def load_transcript( gene, trans_id, conn ):
    cursor = conn.cursor()

    query = "SELECT location FROM annotations.exons WHERE transcript = %s;"

    cursor.execute( query, (str(trans_id),) )

    exons = [(x[0].lower, x[0].upper) for x in cursor.fetchall() ]
    trans = Transcript( trans_id, gene.chrm, gene.strand, exons, None,
                        gene_id=gene.id )
    # try and load the coding sequence
    query = "SELECT region FROM annotations.transcript_regions WHERE transcript = %s and type='CDS';"
    cursor.execute( query, (trans_id,) )
    res = cursor.fetchall()

    if len( res ) > 0:
        #load the cds regions, the 5 prime utr and and 3 prime utr, start and stop codons

        genome_cds_region = ( trans.genome_pos(res[0][0].lower),  trans.genome_pos(res[0][0].upper) )
        try:
            trans.add_cds_region( genome_cds_region )

        except:
            print "could not add cds region (probably because the cds region does not overlap any of the exons)"
    return trans

def load_transcripts( gene, conn ):
    """load transcripts from given gene"""
    assert len( gene.transcripts ) == 0
    transcript_ids = load_transcript_ids( gene, conn )
    for t_id in transcript_ids:
        gene.transcripts.append( load_transcript( gene, t_id, conn ) )

    return


def parse_contig_composite( data ):
    name, ann_id = data[1:-1].split(",")
    return ( name, int(ann_id) )


def load_genes_intersecting_regions(start, end, chrm, conn):
    """load genes from database that intersect the start and and stop arguments"""
    cur = conn.cursor()
    #select name, id, contig, strand, location  from (select * from annotations.genes) as loc where loc.location && int4range('228292', '228776', '[]') and loc.contig = ('1', 1)::contig;
    query = "select name, id, contig, strand, location  from (select * from annotations.genes) as loc where loc.location && int4range(%s, %s, '[]') and loc.contig = (%s, 1)::contig;"
    cur.execute(query, (start, end, chrm.upper() ))
    #print cur.query
    result = cur.fetchall()
    genes = {}
    cur.close()
    for name, id, contig, strand, location in result:

        genes[name] = Gene(id, parse_contig_composite(contig), strand, location.lower, location.upper, [] )#TODO may need to change to interbase coordinates

    return genes


app = Flask(__name__)
@app.route("/JBrowse/stats/global")
def get_global_stats():
    result = {}
    result['featureDensity'] = 0.00001
    return json.dumps(result)


def generate_json(intersecting_genes):
    #generate json according to jbrowse scheme
    res = {}
    res['features'] = []
    for gene_name, gene_object in intersecting_genes.iteritems():

        for i,transcript in enumerate(gene_object.transcripts):
            trans = {}
            if (transcript.cds_exons) != None:
                trans['type'] = "mRNA"
                trans['start'] = transcript.start -1
                trans['end'] = transcript.stop-1
                trans['strand'] = 1 if transcript.strand ==  '+' else 0
                trans['name'] = gene_name
                trans['uniqueID'] = gene_name + "_transcript_" + str(i)
                trans ['subfeatures'] = []

                assert transcript.cds_region != None
                for start,end in transcript.cds_exons:
                    cds_entry = {}
                    cds_entry['type'] = "CDS"

                    cds_entry['start'] = start -1
                    cds_entry['end'] = end-1
                    trans['subfeatures'].append(cds_entry)

                for start, end in transcript.fp_utr_exons:
                    fputr_entry = {}
                    fputr_entry["type"] = "five_prime_UTR"
                    fputr_entry["start"] = start -1
                    fputr_entry["end"] = end-1
                    fputr_entry['strand'] = 1 if transcript.strand ==  '+' else 0
                    trans['subfeatures'].append(fputr_entry)
                for start,end in transcript.tp_utr_exons:
                    tputr_entry = {}
                    tputr_entry["type"] = "three_prime_UTR"
                    tputr_entry["start"] = start-1
                    tputr_entry["end"] = end-1
                    tputr_entry['strand'] = 1 if transcript.strand ==  '+' else 0
                    trans['subfeatures'].append(tputr_entry)

                    codon_entry = {}
                    codon_entry['type'] = "start_codon"
                    codon_entry["start"] = transcript.start_codon -1
                    codon_entry["end"] = transcript.start_codon + 2
                    codon_entry['strand'] = 1 if transcript.strand ==  '+' else 0
                    trans['subfeatures'].append(codon_entry)

                    codon_entry = {}
                    codon_entry['type'] = "stop_codon"
                    codon_entry["start"] = transcript.stop_codon-1
                    codon_entry["end"] = transcript.stop_codon + 2
                    codon_entry['strand'] = 1 if transcript.strand ==  '+' else 0
                    trans['subfeatures'].append(codon_entry)
                    res['features'].append(trans)
    return res



@app.route("/JBrowse/features/<ref_seq>")
def get_feature_data(ref_seq):
    res = {}
    res['features'] = []
    refseq_name = ref_seq
    chrm = refseq_name.replace('chr','')
    start= request.args.get('start')
    end = request.args.get('end')

    conn = psycopg2.connect("host=localhost dbname=rnaseq user=urvish")

    # #load gene objects from db
    intersecting_genes = load_genes_intersecting_regions(start, end, chrm, conn)

    # #load gene objects with their subsequent transcripts
    [load_transcripts(gene_object, conn)  for gene_name, gene_object in intersecting_genes.iteritems()]



    res_json = generate_json(intersecting_genes)
    #print json.dumps(res_json)
    conn.close()
    return json.dumps(res_json)

#http://10.20.0.42/jsrv/JBrowse/features/chr21?start=41551251&end=41556658/
# curl -i http://127.0.0.1:5000/JBrowse/features/chr7?start=55086724\&end=55236329


if __name__ == '__main__':
    #logging.basicConfig(stream=sys.stderr)
    app.run()

