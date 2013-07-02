__author__ = 'urvishparikh'
import sys
import os
import json
sys.path.append(os.path.join(os.path.dirname(__file__), "../psql"))
import vcf_lib
import vcf_psql


def generate_cosmic_description(mutation_id, mutation_aa, count):
    result= []
    html_link = "<a href= http://cancer.sanger.ac.uk/cosmic/mutation/overview?id=%s> %s </a>" % (mutation_id, mutation_id)
    return html_link + '_'+ mutation_aa+ "_" + "(" + count + ")"


def vcf_json(query_result, cur):
    """
    parse query result and build json for JBrowse
    :param query_result: list of namedtuples of psql query result: [namedtuple('vcf_line', ['contig', 'pos', 'ref',
    'alt', 'info', 'filter', 'rsid', 'experiment_id', 'ref_cnt', 'alt_cnt'])]
    :return: json that JBrowse can recognize
    """
    track_json = dict()
    track_json['features'] = []
    for vcf_line in query_result:
        json_line = dict()
        vcf_line.rsid
        if vcf_line.rsid:

            json_line['name'] = vcf_line.rsid
        json_line['start'] = vcf_line.pos
        if len(vcf_line.alt) ==  len(vcf_line.ref) == 1:
            json_line['type'] = 'SNV'
        else:
            json_line['type'] = 'indel'
        json_line['description'] = json_line['type'] + ' ' + vcf_line.ref + ' -> ' + vcf_line.alt
        json_line['reference_allele'] = vcf_line.ref
        json_line['alternate_allele'] =vcf_line.alt
        json_line['experiment'] = vcf_line.experiment_id
        snpeff = vcf_lib.get_snpeff(vcf_line.info)
        json_line['genes'] = list(vcf_lib.get_genes(snpeff))
        mutations = list(vcf_lib.get_mutations(snpeff))
        #FORMAT: [gene]p.[wildtype][pos][mutant]([Transcript])
        mutation_nums = [vcf_psql.get_AA_pos(x.split('p.')[1].split('(')[0]) for x in mutations]

        cosmic_mutations = vcf_psql.get_cosmic_overlapping_mutations(json_line['genes'], mutation_nums, cur)

        json_line['cosmic_overlap'] = ", ".join([generate_cosmic_description(*x) for x in cosmic_mutations])
        json_line['ref_allele_cnt'] = vcf_line.ref_cnt
        json_line['alt_allele_cnt'] = vcf_line.alt_cnt

        track_json['features'].append(json_line)


    return json.dumps(track_json)

