/**
 * copyright urvishparikh@gmail.com
 * User: urvishparikh
 * Date: 7/1/13
 * Time: 4:05 PM
 */


define(['dojo/_base/declare',
        'dojo/_base/array',
        'dojo/request/xhr',
        'dojo/io-query',
        'JBrowse/Store/SeqFeature',
        './VcfWebservFeature'
       ],

    function( declare,
              array,
              xhr,
              ioquery,
              SeqFeatureStore,
              vcfWebservFeature
            ) {
        return declare(SeqFeatureStore, {
//            constructor: function( args ){
//                //initialize psql
//            },

            getGlobalStats : function(callback, errorCallback) {
                var url = this._makeURL('stats/global')
                xhr.get(url, {
                    handleAs: 'json'
                }).then(
                        callback,
                        this._errorHandler(errorCallback)
                    );
            },
            getRegionStats: function( query, successCallback, errorCallback ) {

                if( ! this.config.region_stats ) {
                    this._getRegionStats.apply( this, arguments );
                    return;
                }

                var url = this._makeURL( 'stats/region', query );
                xhr.get( url, {
                     handleAs: 'json'
                }).then(
                    successCallback,
                    this._errorHandler( errorCallback )
                );

            },


            getFeatures: function( query, featureCallback, endCallback, errorCallback ) {
                var thisB = this;
                var url = this._makeURL( 'features', query );
                errorCallback = this._errorHandler( errorCallback );
                xhr.get( url, {
                     handleAs: 'json'
                }).then(
                    dojo.hitch( this, '_makeFeatures', featureCallback, endCallback, errorCallback ),
                    errorCallback
                );
            },





//HELPER METHODS:
            _makeURL: function( subpath, query ) {
                var url = this.config.baseUrl + subpath;
                if( query ) {
                    query = dojo.mixin( {}, query );
                    if( this.config.query )
                        //mixes in the current query with the config.query
                        // object (python-like dictionary)
                        query = dojo.mixin( dojo.mixin( {}, this.config.query ),
                                    query);
                    var ref = query.ref || (this.refSeq||{}).name;
                    delete query.ref;
                    url += (ref ? '/' + ref : '' ) + '?' + ioquery.objectToQuery( query );
                }
                return url;
            },
            _errorHandler: function( handler ) {
                handler = handler || function(e) {
                    console.error( e, e.stack );
                    throw e;
                };
                return dojo.hitch( this, function( error ) {
                    var httpStatus = ((error||{}).response||{}).status;
                    if( httpStatus >= 400 ) {
                        handler( "HTTP " + httpStatus + " fetching "+error.response.url+" : "+error.response.text );
                    }
                    else {
                        handler( error );
                    }
                });
            },
            _makeFeatures: function( featureCallback, endCallback, errorCallback, featureData ) {
                var features;
                if( featureData && ( features = featureData.features ) ) {
                    for( var i = 0; i < features.length; i++ ) {
                        featureCallback( this._makeFeature( features[i] ) );
                    }
                }

                endCallback();
            },

            _makeFeature: function( data, parent ) {
                array.forEach(['start','end','strand'], function( field ) {
                    if( field in data )
                        data[field] = parseInt( data[field] );
                });
                if( 'score' in data )
                    data.score = parseFloat( data.score );

                this._parseInfoField(data, data.info)
                console.log(data)
                return new vcfWebservFeature({
                    data: data,
                    parent: parent

                });
            },

            _parseInfoField: function( featureData, infoVal ) {
                if( !infoVal || infoVal == '.' )
                    return;
                var info = this._parseKeyValue( infoVal );

                // decorate the info records with references to their descriptions
                for( var field in info ) {
                    if( info.hasOwnProperty( field ) ) {
                            var i = info[field] = {
                                values: info[field],
                                toString: function() { return (this.values || []).join(','); }
                            };
                            var meta = this._vcfReservedInfoFields[field];
                            if( meta )
                                i.meta = meta;
                    }
                }
                delete featureData['info'];

                dojo.mixin( featureData, info );
            },

            _vcfReservedInfoFields: {
                    // from the VCF4.1 spec, http://www.1000genomes.org/wiki/Analysis/Variant%20Call%20Format/vcf-variant-call-format-version-41
                    AA:    { description: "ancestral allele" },
                    AC:    { description: "allele count in genotypes, for each ALT allele, in the same order as listed" },
                    AF:    { description: "allele frequency for each ALT allele in the same order as listed: use this when estimated from primary data, not called genotypes" },
                    AN:    { description: "total number of alleles in called genotypes" },
                    BQ:    { description: "RMS base quality at this position" },
                    CIGAR: { description: "cigar string describing how to align an alternate allele to the reference allele" },
                    DB:    { description: "dbSNP membership" },
                    DP:    { description: "combined depth across samples, e.g. DP=154" },
                    END:   { description: "end position of the variant described in this record (esp. for CNVs)" },
                    H2:    { description: "membership in hapmap2" },
                    MQ:    { description: "RMS mapping quality, e.g. MQ=52" },
                    MQ0:   { description: "Number of MAPQ == 0 reads covering this record" },
                    NS:    { description: "Number of samples with data" },
                    SB:    { description: "strand bias at this position" },
                    SOMATIC: { description: "indicates that the record is a somatic mutation, for cancer genomics" },
                    VALIDATED: { description: "validated by follow-up experiment" },

                    //specifically for structural variants
                    "IMPRECISE": { number: 0, type: 'Flag', description: "Imprecise structural variation" },
                    "NOVEL":     { number: 0, type: 'Flag',description: "Indicates a novel structural variation" },
                    "END":       { number: 1, type: 'Integer', description: "End position of the variant described in this record" },

                    // For precise variants, END is POS + length of REF allele -
                    // 1, and the for imprecise variants the corresponding best
                    // estimate.

                    "SVTYPE": { number: 1, type: 'String',description: "Type of structural variant" },

                    // Value should be one of DEL, INS, DUP, INV, CNV, BND. This
                    // key can be derived from the REF/ALT fields but is useful
                    // for filtering.

                    "SVLEN": { number:'.',type: 'Integer', description: 'Difference in length between REF and ALT alleles' },

                    // One value for each ALT allele. Longer ALT alleles
                    // (e.g. insertions) have positive values, shorter ALT alleles
                    // (e.g. deletions) have negative values.

                    "CIPOS":  { number: 2, "type": 'Integer', "description": 'Confidence interval around POS for imprecise variants' },
                    "CIEND":  { number: 2, "type": 'Integer', "description": "Confidence interval around END for imprecise variants" },
                    "HOMLEN": {            "type": "Integer", "description": "Length of base pair identical micro-homology at event breakpoints" },
                    "HOMSEQ": {            "type": "String",  "description": "Sequence of base pair identical micro-homology at event breakpoints" },
                    "BKPTID": {            "type": "String",  "description": "ID of the assembled alternate allele in the assembly file" },

                    // For precise variants, the consensus sequence the alternate
                    // allele assembly is derivable from the REF and ALT
                    // fields. However, the alternate allele assembly file may
                    // contain additional information about the characteristics of
                    // the alt allele contigs.

                    "MEINFO":  { number:4, "type": "String", "description": "Mobile element info of the form NAME,START,END,POLARITY" },
                    "METRANS": { number:4, "type": "String", "description": "Mobile element transduction info of the form CHR,START,END,POLARITY" },
                    "DGVID":   { number:1, "type": "String", "description": "ID of this element in Database of Genomic Variation"},
                    "DBVARID": { number:1, "type": "String", "description": "ID of this element in DBVAR"},
                    "DBRIPID": { number:1, "type": "String", "description": "ID of this element in DBRIP"},
                    "MATEID":  {           "type": "String", "description": "ID of mate breakends"},
                    "PARID":   { number:1, "type": "String", "description": "ID of partner breakend"},
                    "EVENT":   { number:1, "type": "String", "description": "ID of event associated to breakend"},
                    "CILEN":   { number:2, "type": "Integer","description": "Confidence interval around the length of the inserted material between breakends"},
                    "DP":      { number:1, "type": "Integer","description": "Read Depth of segment containing breakend"},
                    "DPADJ":   {           "type": "Integer","description": "Read Depth of adjacency"},
                    "CN":      { number:1, "type": "Integer","description": "Copy number of segment containing breakend"},
                    "CNADJ":   {           "type": "Integer","description": "Copy number of adjacency"},
                    "CICN":    { number:2, "type": "Integer","description": "Confidence interval around copy number for the segment"},
                    "CICNADJ": {           "type": "Integer","description": "Confidence interval around copy number for the adjacency"}
                },

            _parseKeyValue: function( str, pairSeparator, valueSeparator, lowercaseKeys ) {
                pairSeparator  = pairSeparator  || ';';
                valueSeparator = valueSeparator || ',';

                var data = {};
                var currKey = '';
                var currValue = '';
                var state = 1;  // states: 1: read key to =, 2: read value to comma or sep, 3: read value to quote
                for( var i = 0; i < str.length; i++ ) {
                    if( state == 1 ) { // read key
                        if( str[i] == '=' ) {
                            if( lowercaseKeys )
                                currKey = currKey.toLowerCase();
                            data[currKey] = [];
                            state = 2;
                        }
                        else if( str[i] == pairSeparator ) {
                            if( lowercaseKeys )
                                currKey = currKey.toLowerCase();
                            data[currKey] = [true];
                            currKey = '';
                            state = 1;
                        }
                        else {
                            currKey += str[i];
                        }
                    }
                    else if( state == 2 ) { // read value to value sep or pair sep
                        if( str[i] == valueSeparator ) {
                            data[currKey].push( currValue );
                            currValue = '';
                        }
                        else if( str[i] == pairSeparator ) {
                            data[currKey].push( currValue );
                            currKey = '';
                            state = 1;
                            currValue = '';
                        } else if( str[i] == '"' ) {
                            state = 3;
                            currValue = '';
                        }
                        else
                            currValue += str[i];
                    }
                    else if( state == 3 ) { // read value to quote
                        if( str[i] != '"' )
                            currValue += str[i];
                        else
                            state = 2;
                    }
                }

                if( state == 2 || state == 3) {
                    data[currKey].push( currValue );
                }

                return data;
            }




        })
    })
