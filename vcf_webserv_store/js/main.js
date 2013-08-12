//modeled after: https://github.com/GMOD/jbrowse/blob/master/src/JBrowse/Browser.js
define(
       [
           'dojo/_base/declare',
           'dijit/MenuItem',
           'JBrowse/Plugin',
           './View/ExperimentPicker',
           'dojo/_base/array',
           'dojo/topic'
       ],
    function( declare, dijitMenuItem, JBPlugin, ExperimentPicker, array, topic ) {

return declare( JBPlugin,
{


    constructor: function( args ) {
        var thisB = this;
        var browser = args.browser;
        this.config = {
            logMessages: true
        };
        this.browser = browser;
        console.log( "vcf_webserv_store plugin starting" );
        browser.registerTrackType({
            type:                 'JBrowse/View/Track/HTMLVariants',
            defaultForStoreTypes: [ 'vcf_webserv_store/Store/SeqFeature/VcfWebservStore' ],
            label: 'vcf_webserv'
        });



        var expPicker = new dijitMenuItem(
                {
                    label: "select vcf track",
                    checked: false,
                    onClick:
                        dojo.hitch(this, 'OpenExperimentPicker')

                });
        browser.addGlobalMenuItem( 'file', expPicker );


    },
    publish: function() {
        if( this.config.logMessages )
            console.log( arguments );

        return topic.publish.apply( topic, arguments );
    },
    OpenExperimentPicker: function()
    {
        new ExperimentPicker({Browser: this.browser})
        .show({
            openCallback: dojo.hitch( this, function( results ) {
                var confs = results.trackConfs || [];
                if( confs.length ) {

                    // tuck away each of the store configurations in
                    // our store configuration, and replace them with
                    // their names.
                    array.forEach( confs, function( conf ) {
                        var storeConf = conf.store;
                        if( storeConf && typeof storeConf == 'object' ) {
                            delete conf.store;
                            var name = this.browser._addStoreConfig( storeConf.name, storeConf );
                            conf.store = name;
                        }
                    },this);

                    // send out a message about how the user wants to create the new tracks
                    this.publish( '/jbrowse/v1/v/tracks/new', confs );

                    // if requested, send out another message that the user wants to show them
                    if( results.trackDisposition == 'openImmediately' )
                        this.publish( '/jbrowse/v1/v/tracks/show', confs );
                }
            })
        });
    }

});

});