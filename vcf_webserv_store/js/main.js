define([
           'dojo/_base/declare',
           'JBrowse/Plugin'
       ],
       function(
           declare,
           JBrowsePlugin
       ) {
return declare( JBrowsePlugin,
{
    constructor: function( args ) {
        var browser = args.browser;

        // do anything you need to initialize your plugin here
        console.log( "vcf_webserv_store plugin starting" );
        browser.registerTrackType({
            type:                 'JBrowse/View/Track/HTMLVariants',
            defaultForStoreTypes: [ 'vcf_webserv_store/Store/SeqFeature/VcfWebservStore' ],
            label: 'vcf_webserv'
        });

    }
});
});
