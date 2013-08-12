__author__ = 'urvishparikh'

from flask import Flask, request
import json
import os, sys
import logging
import psycopg2
import urllib

sys.path.append(os.path.join(os.path.dirname(__file__), "../psql"))
from vcf_psql import query_psql, query_multicorn
import psycopg2
from collections import defaultdict

from jbrowse_json_builder import vcf_json

app = Flask(__name__)


conn = psycopg2.conn = psycopg2.connect("host=localhost dbname=dbname user=username") # host=localhost is necessary for
                                                                                      # the webservice to know what to connect to

@app.route("/JBrowse/experiment_name/<id>")
def get_experiment_name(id):



    result = {}
    result['features'] = []

    if id == "exp_id":
        cur = conn.cursor()
        normal_exp_id = request.args.get('normal')
        if (normal_exp_id):
            #means that the normal experiment id has already been chosen and now we must query the corrosponding
            #tumor experiment ID
            query = """select e.patient_ctig_name, e.id, e.pre_post_norm, e.exp_type from (select distinct exp_ids[2]
            from experiments.somatic_variant_files_current where exp_ids[1] = %s) m, experiments.experiments e
            where e.id = m.exp_ids"""
            cur.execute(query, (normal_exp_id,))
        else:
            query = """select e.patient_ctig_name, e.id, e.pre_post_norm, e.exp_type from (select distinct exp_ids[1]
            from experiments.somatic_variant_files_current) m, experiments.experiments e where e.id = m.exp_ids"""
            cur.execute(query)
        res = cur.fetchall()
        for patient_ctig_name, id, pre_post_norm, exp_type in res:
            record = {}
            record['patient_ctig_name'] = patient_ctig_name
            record['id'] = id
            record['pre_post_norm'] = pre_post_norm
            record['exp_type'] = exp_type
            result['features'].append(record)
        return json.dumps(result)
    elif id == 'get_vcf':
        cur = conn.cursor()
        normal_exp_id = request.args.get('normal')
        tumor_exp_id = request.args.get('tumor')
        assert normal_exp_id and tumor_exp_id, "need to have both normal and tumor query parameters"


        query = "select results_loc_passed_snp, results_loc_passed_indel,results_loc_all_snp,\
        results_loc_all_indel from experiments.somatic_variant_files_current where exp_ids = '{%s,%s}'" \
                % (normal_exp_id, tumor_exp_id)

        cur.execute(query)


        res = cur.fetchall()
        record = defaultdict(list)
        for result_loc_passed_snp, results_loc_passed_indel, results_loc_all_snp, results_loc_all_indel in res:

            record['passed_snp'].append(result_loc_passed_snp)
            record['passed_indel'].append(results_loc_passed_indel)
            record['all_snp'].append(results_loc_all_snp)
            record['all_indel'].append(results_loc_all_indel)
        result['features'].append(record)


        return json.dumps(result)
    # elif id == "get_second_id":
    #     if request.args.get('first_id'):
    #         query = "select * from experiments.somatic_variant_files_current where exp_ids[1] = %s"
    #         conn.execute()




@app.route("/JBrowse/stats/global")
def get_global_stats():
    """
    #TODO fix this to be more dynamic
    :return: json result of density of features for the vcf
    """
    result = {}
    result['featureDensity'] = 0.00001
    return json.dumps(result)


@app.route("/JBrowse/features/<ref_seq>")
def get_feature_data(ref_seq):
    """
    :param ref_seq(chromosome): the query string in the format of (refseq_name)?start=234&end=5678
    :return: json of the features
    JBrowse Track should look like:
    {
    "label":      "my_rest_track",
    "key":        "REST Test Track",
    "type":       "JBrowse/View/Track/HTMLFeatures",
    "storeClass": "JBrowse/Store/SeqFeature/REST",
    "baseUrl":    "http://ip_address/JBrowse",
    "query": {
        "type": "vcf"  || "transcript"
        "experiment_id": "experiment-id1_experiment-id2" (experiment_id should relate to sample in vcf)
            }
    }

curl -i http://127.0.0.1:5000/JBrowse/features/chr7?start=123615\&end=208824\&type=vcf\&experiment_id=10_8&vcf_file=
curl -i http://127.0.0.1:5000//jsrv/JBrowse/features/chr1?type=vcf\&experiment_id=70_71\&vcf_file=%2Fdata%2Fscratch%2Fs3_data%2Fpatient-data-results.ctig.com%2FRebiopBarRB3%2FDNA_BWA_CTIG_2013_6_17%2FSTRELKA__VID__115__EIDS__70__72__BIDS__415__419__BCODES__Rebiop-Normal-DNA_ExomeAgilentV5TruSeq-6-19-25-22-70-__Rebiop-TumorPostTx-DNA_ExomeAgilentV5TruSeq-6-20-26-23-72-__all.somatic.indels.dbsnp.snpeff.annotated.gwas.vcf.gz\&start=137499999\&end=149999999


    """
    res = {}
    res['features'] = []
    chr = ref_seq
    start= request.args.get('start')
    end = request.args.get('end')
    type = request.args.get('type')
    cur = conn.cursor()
    if type == 'vcf':
        vcf_file = urllib.unquote_plus(request.args.get('vcf_file'))

        experiment_ids = request.args.get('experiment_id').split('_')


 #       results = query_psql(chr, start, end, experiment_ids, cur)
        results = query_multicorn(vcf_file, chr, start, end, cur)
        print results
        #return json.dumps({'res': len(results)})
        return vcf_json(results, cur)

    #elif type == 'transcript':


if __name__=="__main__":
    app.run()