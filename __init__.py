__author__ = 'urvishparikh'

from flask import Flask, request
import json
import os, sys
import logging
import psycopg2

sys.path.append(os.path.join(os.path.dirname(__file__), "../psql"))
from vcf_psql import query_psql


from jbrowse_json_builder import vcf_json

app = Flask(__name__)
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

curl -i http://127.0.0.1:5000/JBrowse/features/chr7?start=123615\&end=208824\&type=vcf\&experiment_id=10_8
    """
    res = {}
    res['features'] = []
    chr = ref_seq
    chr = chr.replace('chr','')
    start= request.args.get('start')
    end = request.args.get('end')
    type = request.args.get('type')

    conn = psycopg2.conn = psycopg2.connect("host=localhost dbname=ctig user=urvish") # host=localhost is necessary for
                                                                                      # the webservice to know what to connect to
    cur = conn.cursor()
    if type == 'vcf':


        experiment_ids = request.args.get('experiment_id').split('_')

        results = query_psql(chr, start, end, experiment_ids, cur)

        print results
        return vcf_json(results, cur)
    #elif type == 'transcript':


if __name__=="__main__":
    app.run()