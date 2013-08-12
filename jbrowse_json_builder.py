__author__ = 'urvishparikh'
import sys
import os
import json
sys.path.append(os.path.join(os.path.dirname(__file__), "../psql"))
import vcf_lib
import vcf_psql
import random
import string


def generate_cosmic_description(mutation_id, mutation_aa, count):
    result= []
    html_link = "<a href= http://cancer.sanger.ac.uk/cosmic/mutation/overview?id=%s> %s </a>" % (mutation_id, mutation_id)
    return html_link + '_'+ mutation_aa+ "_" + "(" + str(count) + ")"


def vcf_json(query_result, cur):
    """
    parse query result and build json for JBrowse
    :param query_result: list of namedtuples of psql query result: vcf_line = namedtuple('vcf_line', ['chrom', 'pos', 'rsid', 'ref', 'alt', 'ref_allele_cnt', 'alt_allele_cnt',
                                       'genes', 'amino_acid_change', 'exon_number', 'cosmic_overlapping_mutations', 'protein_domain' ])
    :return: json that JBrowse can recognize
    """
    track_json = dict()
    track_json['features'] = []

    for vcf_line in query_result:
        json_line = dict()
        if vcf_line.rsid and vcf_line.rsid != '.':
            print vcf_line.rsid
            json_line['name'] = vcf_line.rsid
        json_line['start'] = vcf_line.pos
        if len(vcf_line.alt) ==  len(vcf_line.ref) == 1:
            json_line['type'] = 'SNV'
        else:
            json_line['type'] = 'indel'
        json_line['description'] = json_line['type'] + ' ' + vcf_line.ref + ' -> ' + vcf_line.alt
        json_line['reference_allele'] = vcf_line.ref
        json_line['uniqueID'] =  ''.join(random.choice(string.ascii_uppercase + string.digits)
                                                                for x in range(5))


        json_line['cosmic_overlap'] = vcf_line.cosmic_overlapping_mutations
        json_line['protein_domain'] = vcf_line.protein_domain

        json_line['alternate_allele'] =vcf_line.alt

        json_line['genes'] = vcf_line.genes



        print json_line
        #cosmic_mutations = vcf_line.get_cosmic_overlapping_mutations

        #json_line['cosmic_overlap'] = ", ".join([generate_cosmic_description(*x) for x in cosmic_mutations])
        json_line['ref_allele_cnt'] = vcf_line.ref_allele_cnt
        json_line['alt_allele_cnt'] = vcf_line.alt_allele_cnt


        track_json['features'].append(json_line)
        print json_line


    return json.dumps(track_json)

