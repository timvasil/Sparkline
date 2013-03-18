Ext JS 4 + jQuery Sparklines
============================

This is a column subclass to render sparklines via [jQuery sparklines](http://omnipotent.net/jquery.sparkline).

You can see a [demo here](http://jsfiddle.net/timvasil/2gVUh/1/).

Features
========
 Compound sparklines
- Single sparkline config for entire column
- Separate sparkline configs for each cell in a column
- Renders sparklines asynchornously (in configurable increments) to minimize lag
- Optional override to minimize flicker on updates

Example Usage
=============
    Ext.create('Ext.grid.Panel', {
        renderTo: Ext.getBody(),
        width: 600,
        height: 250,
        store: Ext.create('Ext.data.Store', {
            storeId: 'simpsonsStore',
            fields: ['name', 'values'],
            idProperty: 'name',
            data: {
                'items': [{
                    'name': 'Lisa',
                    "values": [1, 2, 3, 10, 5]
                }, {
                    'name': 'Bart',
                    "values": [1, 2, 3, 10, 20]
                }, {
                    'name': 'Homer',
                    "values": [1, 2, 3, 10, 5]
                }, {
                    'name': 'Marge',
                    "values": [1, 2, 3, 10, 52]
                }]
            },
            proxy: {
                type: 'memory',
                reader: {
                    type: 'json',
                    root: 'items'
                }
            }
        }),
    
        columns: [{
            text: 'Name',
            dataIndex: 'name'
        }, {
            text: 'Chart',
            dataIndex: 'values',
            xtype: 'sparklinecolumn',
            sparklineConfig: [{
                type: 'line',
                height: '19',
                width: '100%',
                chartRangeMin: 0,
                chartRangeMax: 1,
                spotColor: '',
                maxSpotColor: '',
                minSpotColor: '',
                highlightLineColor: '#000',
                highlightSpotColor: '#000',
                lineColor: '#080',
                fillColor: '#cec'
            }]
        }]
    });

Tips
====
For the best experience with this extension:

1.  See the "manualUpdate" property for information on preventing flicker during dynamic updates.
2.  Add a CSS style to ensure the tooltip is sized correctly by overriding incompatible Ext JS sizing:

>     .jqstooltip {
>         box-sizing: content-box;
>         height: auto !important;
>         width: auto !important;
>     }
