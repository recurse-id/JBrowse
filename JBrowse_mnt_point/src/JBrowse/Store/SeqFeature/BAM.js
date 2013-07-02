//>>built
require({cache:{"JBrowse/Store/SeqFeature/GlobalStatsEstimationMixin":function(){define("JBrowse/Store/SeqFeature/GlobalStatsEstimationMixin",["dojo/_base/declare","dojo/_base/array","dojo/Deferred"],function(n,q,o){return n(null,{_estimateGlobalStats:function(){var e=new o,h=function(f,d,e){var a=this,i=0.75*f.start+0.25*f.end,c=Math.max(0,Math.round(i-d/2)),b=Math.min(Math.round(i+d/2),f.end),k=[];this._getFeatures({ref:f.name,start:c,end:b},function(b){k.push(b)},function(){k=q.filter(k,function(k){return k.get("start")>=
c&&k.get("end")<=b});e.call(a,d,{featureDensity:k.length/d,_statsSampleFeatures:k.length,_statsSampleInterval:{ref:f.name,start:c,end:b,length:d}})},function(b){console.error(b);e.call(a,d,null,b)})},d=function(f,l,j){if(j)e.reject(j);else{var a=this.refSeq.end-this.refSeq.start;300<=l._statsSampleFeatures||2*f>a||j?e.resolve(l):h.call(this,this.refSeq,2*f,d)}};h.call(this,this.refSeq,100,d);return e}})})},"JBrowse/Store/SeqFeature/BAM/File":function(){define("dojo/_base/declare,dojo/_base/array,JBrowse/has,JBrowse/Util,JBrowse/Errors,JBrowse/Store/LRUCache,./Util,./LazyFeature".split(","),
function(n,q,o,e,h,d,f,l){var j=function(){console.error.apply(console,arguments)},a=e.fastDeclare({constructor:function(b,k,a){this.minv=b;this.maxv=k;this.bin=a},toUniqueString:function(){return this.minv+".."+this.maxv+" (bin "+this.bin+")"},toString:function(){return this.toUniqueString()},fetchedSize:function(){return this.maxv.block+65536-this.minv.block+1}}),i=f.readInt,c=f.readVirtualOffset;return n(null,{constructor:function(b){this.store=b.store;this.data=b.data;this.bai=b.bai;this.chunkSizeLimit=
b.chunkSizeLimit||5E6},init:function(b){var k=b.success||function(){},a=b.failure||function(b){console.error(b,b.stack)};this._readBAI(dojo.hitch(this,function(){this._readBAMheader(function(){k()},a)}),a)},_readBAI:function(b,k){this.bai.fetch(dojo.hitch(this,function(a){if(a)if(o("typed-arrays")){var g=new Uint8Array(a);if(21578050!=i(g,0))j("Not a BAI file"),k("Not a BAI file");else{var f=i(g,4);this.indices=[];for(var m=8,d=0;d<f;++d){for(var e=m,h=i(g,m),m=m+4,l=0;l<h;++l){i(g,m);for(var n=i(g,
m+4),m=m+8,p=0;p<n;p++)this._findMinAlignment(c(g,m)),m+=16}l=i(g,m);m+=4;this._findMinAlignment(l?c(g,m):null);m+=8*l;if(0<h||0<l)this.indices[d]=new Uint8Array(a,e,m-e)}this.empty=!this.indices.length;b(this.indices,this.minAlignmentVO)}}else j("Web browser does not support typed arrays"),k("Web browser does not support typed arrays");else j("No data read from BAM index (BAI) file"),k("No data read from BAM index (BAI) file")}),k)},_findMinAlignment:function(b){if(b&&(!this.minAlignmentVO||0>this.minAlignmentVO.cmp(b)))this.minAlignmentVO=
b},_readBAMheader:function(b,k){var a=this;a.data.read(0,a.minAlignmentVO?a.minAlignmentVO.block+65535:null,function(g){g=f.unbgzf(g);g=new Uint8Array(g);21840194!=i(g,0)?(j("Not a BAM file"),k("Not a BAM file")):(g=i(g,4),a._readRefSeqs(g+8,262144,b,k))},k)},_readRefSeqs:function(b,k,a,g){var c=this;c.data.read(0,b+k,function(m){var m=f.unbgzf(m),m=new Uint8Array(m),d=i(m,b),e=b+4;c.chrToIndex={};c.indexToChr=[];for(var h=0;h<d;++h){for(var l=i(m,e),j="",p=0;p<l-1;++p)j+=String.fromCharCode(m[e+
4+p]);p=i(m,e+l+4);c.chrToIndex[c.store.browser.regularizeReferenceName(j)]=h;c.indexToChr.push({name:j,length:p});e=e+8+l;if(e>m.length){k*=2;console.warn("BAM header is very big.  Re-fetching "+k+" bytes.");c._readRefSeqs(b,k,a,g);return}}a()},g)},blocksForRange:function(b,k,r){var g=this.indices[b];if(!g)return[];for(var b=function(){for(var b={},a=this._reg2bins(k,r),g=0;g<a.length;++g)b[a[g]]=!0;return b}.call(this),f=[],d=[],e=i(g,0),h=4,l=0;l<e;++l){var j=i(g,h),n=i(g,h+4),h=h+8;if(b[j])for(var p=
0;p<n;++p){var o=c(g,h),q=c(g,h+8);(4681>j?d:f).push(new a(o,q,j));h+=16}else h+=16*n}var t=function(){for(var b=null,a=i(g,h),d=Math.min(k>>14,a-1),a=Math.min(r>>14,a-1);d<=a;++d){var f=c(g,h+4+8*d);if(f&&(!b||0<f.cmp(b)))b=f}return b}();t&&(d=function(b){for(var a=[],k=0;k<b.length;++k){var g=b[k];g.maxv.block>=t.block&&a.push(g)}return a}(d));b=d.concat(f).sort(function(b,a){return b.minv.block-a.minv.block||b.minv.offset-a.minv.offset});f=[];if(b.length){d=b[0];for(e=1;e<b.length;++e)l=b[e],l.minv.block==
d.maxv.block?d=new a(d.minv,l.maxv,"merged"):(f.push(d),d=l);f.push(d)}return f},fetch:function(b,a,c,g,d,f){var b=this.store.browser.regularizeReferenceName(b),b=this.chrToIndex&&this.chrToIndex[b],i;0<=b?(i=this.blocksForRange(b,a,c))||f(new h.Fatal("Error in index fetch")):i=[];i.toString=function(){return this.join(", ")};try{this._fetchChunkFeatures(i,b,a,c,g,d,f)}catch(e){f(e)}},_fetchChunkFeatures:function(b,a,c,g,i,f,l){if(b.length){for(var j=0,n=this.featureCache=this.featureCache||new d({name:"bamFeatureCache",
fillCallback:dojo.hitch(this,"_readChunk"),sizeFunction:function(b){return b.length},maxSize:1E5}),o=0;o<b.length;o++){var s=b[o].fetchedSize();if(s>this.chunkSizeLimit){l(new h.DataOverflow("Too many BAM features. BAM chunk size "+e.commifyNumber(s)+" bytes exceeds chunkSizeLimit of "+e.commifyNumber(this.chunkSizeLimit)+"."));return}}var p;q.forEach(b,function(d){n.get(d,function(d,e){e&&!p&&l(e);if(!(p=p||e)){for(var h=0;h<d.length;h++){var n=d[h];if(n._refID==a)if(n.get("start")>g)break;else n.get("end")>=
c&&i(n)}++j==b.length&&f()}})})}else f()},_readChunk:function(b,a){var c=this,g=[];c.data.read(b.minv.block,b.fetchedSize(),function(d){try{var i=f.unbgzf(d,b.maxv.block-b.minv.block+1);c.readBamFeatures(new Uint8Array(i),b.minv.offset,g,a)}catch(e){a(null,new h.Fatal(e))}},function(b){a(null,new h.Fatal(b))})},readBamFeatures:function(b,a,c,g){for(var d=this,f=0;;)if(a>=b.length){g(c);break}else if(300>=f){var e=i(b,a),e=a+4+e-1;if(e<b.length){var h=new l({store:this.store,file:this,bytes:{byteArray:b,
start:a,end:e}});c.push(h);f++}a=e+1}else{window.setTimeout(function(){d.readBamFeatures(b,a,c,g)},1);break}},_reg2bin:function(b,a){--a;return b>>14==a>>14?4681+(b>>14):b>>17==a>>17?585+(b>>17):b>>20==a>>20?73+(b>>20):b>>23==a>>23?9+(b>>23):b>>26==a>>26?1+(b>>26):0},MAX_BIN:37449,_reg2bins:function(b,a){var c,g=[0];--a;for(c=1+(b>>26);c<=1+(a>>26);++c)g.push(c);for(c=9+(b>>23);c<=9+(a>>23);++c)g.push(c);for(c=73+(b>>20);c<=73+(a>>20);++c)g.push(c);for(c=585+(b>>17);c<=585+(a>>17);++c)g.push(c);for(c=
4681+(b>>14);c<=4681+(a>>14);++c)g.push(c);return g}})})},"JBrowse/Store/SeqFeature/BAM/Util":function(){define(["jszlib/inflate","jszlib/arrayCopy","JBrowse/Util"],function(n,q,o){var e=o.fastDeclare({constructor:function(d,f){this.block=d;this.offset=f},toString:function(){return""+this.block+":"+this.offset},cmp:function(d){return d.block-this.block||d.offset-this.offset}}),h={readInt:function(d,f){return d[f+3]<<24|d[f+2]<<16|d[f+1]<<8|d[f]},readShort:function(d,f){return d[f+1]<<8|d[f]},readFloat:function(d,
f){for(var e=new Uint8Array(4),h=0;4>h;h++)e[h]=d[f+h];return(new Float32Array(e.buffer))[0]},readVirtualOffset:function(d,f){var h=4294967296*(d[f+6]&255)+16777216*(d[f+5]&255)+65536*(d[f+4]&255)+256*(d[f+3]&255)+(d[f+2]&255),j=d[f+1]<<8|d[f];return 0==h&&0==j?null:new e(h,j)},unbgzf:function(d,f){for(var f=Math.min(f||Infinity,d.byteLength-27),e=[],j=0,a=[0];a[0]<f;a[0]+=8){var i=new Uint8Array(d,a[0],18);if(!(31==i[0]&&139==i[1])){console.error("invalid BGZF block header, skipping",i);break}var i=
h.readShort(i,10),i=a[0]+12+i,c;try{c=n(d,i,d.byteLength-i,a)}catch(b){if(/^Z_BUF_ERROR/.test(b.statusString)&&e.length)break;else throw b;}c.byteLength&&(j+=c.byteLength,e.push(c))}if(1==e.length)return e[0];j=new Uint8Array(j);for(c=a=0;c<e.length;++c)i=new Uint8Array(e[c]),q(i,0,j,a,i.length),a+=i.length;return j.buffer}};return h})},"JBrowse/Store/SeqFeature/BAM/LazyFeature":function(){define(["dojo/_base/array","JBrowse/Util","./Util","JBrowse/Model/SimpleFeature"],function(n,q,o,e){var h="=,A,C,x,G,x,x,x,T,x,x,x,x,x,x,N".split(","),
d="M,I,D,N,S,H,P,=,X,?,?,?,?,?,?,?".split(","),f=o.readInt,l=o.readShort,j=o.readFloat;return q.fastDeclare({constructor:function(a){this.store=a.store;this.file=a.file;this.data={type:"match",source:a.store.source};this.bytes={start:a.bytes.start,end:a.bytes.end,byteArray:a.bytes.byteArray};this._coreParse()},get:function(a){return this._get(a.toLowerCase())},_get:function(a){return a in this.data?this.data[a]:this.data[a]=this[a]?this[a]():this._flagMasks[a]?this._parseFlag(a):this._parseTag(a)},
tags:function(){return this._get("_tags")},_tags:function(){this._parseAllTags();var a=["seq","seq_reverse_complemented","unmapped"];this._get("unmapped")||a.push("start","end","strand","score","qual","MQ","CIGAR","length_on_ref");this._get("multi_segment_template")&&a.push("multi_segment_all_aligned","multi_segment_next_segment_unmapped","multi_segment_next_segment_reversed","multi_segment_first","multi_segment_last","secondary_alignment","qc_failed","duplicate","next_segment_position");var a=a.concat(this._tagList||
[]),e=this.data,c;for(c in e)e.hasOwnProperty(c)&&"_"!=c[0]&&a.push(c);var b={};return a=n.filter(a,function(a){if(a in this.data&&void 0===this.data[a])return!1;var a=a.toLowerCase(),c=b[a];b[a]=!0;return!c},this)},parent:function(){},children:function(){return this._get("subfeatures")},id:function(){return this._get("name")+"/"+this._get("md")+"/"+this._get("cigar")+"/"+this._get("start")},mq:function(){var a=(this._get("_bin_mq_nl")&65280)>>8;return 255==a?void 0:a},score:function(){return this._get("mq")},
qual:function(){if(!this._get("unmapped")){for(var a=[],e=this.bytes.byteArray,c=this.bytes.start+36+this._get("_l_read_name")+4*this._get("_n_cigar_op")+this._get("_seq_bytes"),b=this._get("seq_length"),d=0;d<b;++d)a.push(e[c+d]);return a.join(" ")}},strand:function(){var a=this._get("xs");return a?"-"==a?-1:1:this._get("seq_reverse_complemented")?-1:1},_l_read_name:function(){return this._get("_bin_mq_nl")&255},_seq_bytes:function(){return this._get("seq_length")+1>>1},seq:function(){for(var a=
"",e=this.bytes.byteArray,c=this.bytes.start+36+this._get("_l_read_name")+4*this._get("_n_cigar_op"),b=this._get("_seq_bytes"),d=0;d<b;++d)var f=e[c+d],a=a+h[(f&240)>>4],a=a+h[f&15];return a},name:function(){return this._get("_read_name")},_read_name:function(){for(var a=this.bytes.byteArray,e="",c=this._get("_l_read_name"),b=this.bytes.start+36,d=0;d<c-1;++d)e+=String.fromCharCode(a[b+d]);return e},_n_cigar_op:function(){return this._get("_flag_nc")&65535},cigar:function(){if(!this._get("unmapped")){for(var a=
this.bytes.byteArray,e=this._get("_n_cigar_op"),c=this.bytes.start+36+this._get("_l_read_name"),b="",h=0,j=0;j<e;++j){var g=f(a,c),l=g>>4,g=d[g&15],b=b+(l+g);"H"!=g&&"S"!=g&&"I"!=g&&(h+=l);c+=4}this.data.length_on_ref=h;return b}},next_segment_position:function(){var a=this.file.indexToChr[this._get("_next_refid")];if(a)return a.name+":"+this._get("_next_pos")},subfeatures:function(){if(this.store.createSubfeatures){var a=this._get("cigar");if(a)return this._cigarToSubfeats(a)}},length_on_ref:function(){this._get("cigar");
return this.data.length_on_ref},_flags:function(){return(this.get("_flag_nc")&4294901760)>>16},end:function(){return this._get("start")+(this._get("length_on_ref")||this._get("seq_length")||void 0)},seq_id:function(){return this._get("unmapped")?void 0:(this.file.indexToChr[this._refID]||{}).name},_bin_mq_nl:function(){with(this.bytes)return f(byteArray,start+12)},_flag_nc:function(){with(this.bytes)return f(byteArray,start+16)},seq_length:function(){with(this.bytes)return f(byteArray,start+20)},
_next_refid:function(){with(this.bytes)return f(byteArray,start+24)},_next_pos:function(){with(this.bytes)return f(byteArray,start+28)},template_length:function(){with(this.bytes)return f(byteArray,start+32)},_coreParse:function(){with(this.bytes)this._refID=f(byteArray,start+4),this.data.start=f(byteArray,start+8)},_parseTag:function(a){if(!this._allTagsParsed){this._tagList=this._tagList||[];for(var e=this.bytes.byteArray,c=this._tagOffset||this.bytes.start+36+this._get("_l_read_name")+4*this._get("_n_cigar_op")+
this._get("_seq_bytes")+this._get("seq_length"),b=this.bytes.end;c<b&&h!=a;){var d=String.fromCharCode(e[c],e[c+1]),h=d.toLowerCase(),g=String.fromCharCode(e[c+2]),c=c+3;switch(g.toLowerCase()){case "a":g=String.fromCharCode(e[c]);c+=1;break;case "i":g=f(e,c);c+=4;break;case "c":g=e[c];c+=1;break;case "s":g=l(e,c);c+=2;break;case "f":g=j(e,c);c+=4;break;case "z":case "h":for(g="";c<=b;){var n=e[c++];if(0==n)break;else g+=String.fromCharCode(n)}break;default:console.warn("Unknown BAM tag type '"+g+
"', tags may be incomplete"),g=void 0,c=b}this._tagOffset=c;this._tagList.push(d);if(h==a)return g;this.data[h]=g}this._allTagsParsed=!0}},_parseAllTags:function(){this._parseTag()},_flagMasks:{multi_segment_template:1,multi_segment_all_aligned:2,unmapped:4,multi_segment_next_segment_unmapped:8,seq_reverse_complemented:16,multi_segment_next_segment_reversed:32,multi_segment_first:64,multi_segment_last:128,secondary_alignment:256,qc_failed:512,duplicate:1024},_parseFlag:function(a){return!!(this._get("_flags")&
this._flagMasks[a])},_parseCigar:function(a){return n.map(a.match(/\d+\D/g),function(a){return[a.match(/\D/)[0].toUpperCase(),parseInt(a)]})},_cigarToSubfeats:function(a){for(var d=[],c=this._get("start"),b,a=this._parseCigar(a),f=0;f<a.length;f++){var h=a[f][1],g=a[f][0];"="===g&&(g="E");switch(g){case "M":case "D":case "N":case "E":case "X":b=c+h;break;case "I":b=c}"N"!==g&&(c=new e({data:{type:g,start:c,end:b,strand:this._get("strand"),cigar_op:h+g},parent:this}),d.push(c));c=b}return d}})})},
"JBrowse/Model/SimpleFeature":function(){define(["JBrowse/Util"],function(n){var q=0,o=n.fastDeclare({constructor:function(e){e=e||{};this.data=e.data||{};this._parent=e.parent;this._uniqueID=e.id||this.data.uniqueID||(this._parent?this._parent.id()+"_"+q++:"SimpleFeature_"+q++);if(e=this.data.subfeatures)for(var h=0;h<e.length;h++)"function"!=typeof e[h].get&&(e[h]=new o({data:e[h],parent:this}))},get:function(e){return this.data[e]},set:function(e,h){this.data[e]=h},tags:function(){var e=[],h=this.data,
d;for(d in h)h.hasOwnProperty(d)&&e.push(d);return e},id:function(e){if(e)this._uniqueID=e;return this._uniqueID},parent:function(){return this._parent},children:function(){return this.get("subfeatures")}});return o})}}});
define("JBrowse/Store/SeqFeature/BAM","dojo/_base/declare,dojo/_base/array,dojo/_base/Deferred,dojo/_base/lang,JBrowse/has,JBrowse/Util,JBrowse/Store/SeqFeature,JBrowse/Store/DeferredStatsMixin,JBrowse/Store/DeferredFeaturesMixin,JBrowse/Model/XHRBlob,JBrowse/Store/SeqFeature/GlobalStatsEstimationMixin,./BAM/File".split(","),function(n,q,o,e,h,d,f,l,j,a,i,c){return n([f,l,j,i],{constructor:function(b){this.createSubfeatures=b.subfeatures;var d=b.bam||new a(this.resolveUrl(b.urlTemplate||"data.bam")),
f=b.bai||new a(this.resolveUrl(b.baiUrlTemplate||(b.urlTemplate?b.urlTemplate+".bai":"data.bam.bai")));this.bam=new c({store:this,data:d,bai:f,chunkSizeLimit:b.chunkSizeLimit});this.source=(d.url?d.url.match(/\/([^/\#\?]+)($|[\#\?])/)[1]:d.blob?d.blob.name:void 0)||void 0;h("typed-arrays")?this.bam.init({success:e.hitch(this,function(){this._deferred.features.resolve({success:!0});this._estimateGlobalStats().then(e.hitch(this,function(a){this.globalStats=a;this._deferred.stats.resolve({success:!0})}),
e.hitch(this,"_failAllDeferred"))}),failure:e.hitch(this,"_failAllDeferred")}):this._failAllDeferred("This web browser lacks support for JavaScript typed arrays.")},hasRefSeq:function(a,c,e){var d=this,a=d.browser.regularizeReferenceName(a);this._deferred.stats.then(function(){c(a in d.bam.chrToIndex)},e)},_getFeatures:function(a,c,d,e){this.bam.fetch(this.refSeq.name,a.start,a.end,c,d,e)}})});