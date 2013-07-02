__author__ = 'urvishparikh'
from jbrowse_json_builder import vcf_json
from collections import namedtuple
import psycopg2

vcf_line = namedtuple('vcf_line', ['contig', 'pos', 'ref', 'alt', 'info', 'filter', 'rsid', 'experiment_id', 'ref_cnt', 'alt_cnt'])


conn = psycopg2.connect("dbname=ctig user=urvish")
cur = conn.cursor()
print vcf_json([vcf_line(contig='(7,1)', pos=123617, ref='A', alt='T', info='NT=ref;QSS=1;QSS_NT=0;SGT=AT->AT;SOMATIC;TQSS=1;TQSS_NT=1', filter='QSS_ref', rsid='', experiment_id=10, ref_cnt=6, alt_cnt=0),
          vcf_line(contig='(7,1)', pos=123617, ref='A', alt='T', info='NT=ref;QSS=1;QSS_NT=0;SGT=AT->AT;SOMATIC;TQSS=1;TQSS_NT=1', filter='QSS_ref', rsid='', experiment_id=8, ref_cnt=0, alt_cnt=2),
          vcf_line(contig='(7,1)', pos=208819, ref='C', alt='A', info='NT=ref;QSS=1;QSS_NT=1;SGT=AC->AC;SOMATIC;TQSS=1;TQSS_NT=1', filter='QSS_ref', rsid='', experiment_id=10, ref_cnt=120, alt_cnt=0),
          vcf_line(contig='(7,1)', pos=208819, ref='C', alt='A', info='NT=ref;QSS=1;QSS_NT=1;SGT=AC->AC;SOMATIC;TQSS=1;TQSS_NT=1', filter='QSS_ref', rsid='', experiment_id=8, ref_cnt=190, alt_cnt=7)],
         cur)