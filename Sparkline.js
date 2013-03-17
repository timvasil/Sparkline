/**
 * @class Ext.ux.column.Sparkline
 * @author Tim Vasil <tim@timvasil.com>
 * 
 * Column to render sparklines via jQuery's Sparkline library (http://omnipotent.net/jquery.sparkline).
 * 
 * MIT open source license
 */
Ext.define('Ext.ux.column.Sparkline', {
    extend: 'Ext.grid.column.Column',
    alias: ['widget.sparklinecolumn'],

    /**
     * {@cfg} {Object} sparklineConfig 
     * Optional Sparkline configuration object, as defined by the jQuery Sparkline API.  This object is
     * passed into the $.sparkline method to draw the sparkline.
     * 
     * If you specify a sparklineConfig value, it's used as the config for *all* rows in the column, and the values
     * provided by dataIndex are assumed to be an array of values (data points) for the chart.
     * 
     * If you don't specify a sparklineConfig value, dataIndex must be an array of arguments to the 
     * $.sparkline function:  [values, config].
     */

    /**
     * {@cfg} {Boolean} globalMaxDataIndex
     * 
     * Optional data index to fetch the max value to be used across all charts (the chartRangeMax property).
     * 
     * Indicates whether the "max" should be set identically across all charts in the column.  When true, the max is 
     * determined dynamically by the largest value in the store.
     */

    /** @Override */
    initComponent: function() {
        var me = this;

        // IDs of cells whose charts need rendering
        me.syncQueue = [];

        // Map of IDs to sparkline values (for charts that need rendering)
        me.syncQueueData = {};

        me.callParent(arguments);
    },

    /** @Override */
    onAdded: function(container) {
        var me = this;

        // Hook column resize events so we can redraw sparklines whose widths are a percentage of the column width
        container.on('columnresize', function() {
            if (me.sparklineConfig && !/.*%$/.test(me.sparklineConfig.width)) {
                // Sparkline width is not a percentage -- no redraw needed
                return;
            }

            var grid = me.up('grid');
            var view = grid.getView();
            var store = grid.getStore();
            store.each(function(record) {
                // Redraw chart in this cell
                view.onUpdate(store, record, null, [me.dataIndex]);
            });
        });

        me.callParent(arguments);
    },

    /** @Override */
    defaultRenderer: function(value, metaData, record) {
        var me = this;
        
        if (!value) {
            return '';
        }

        // The only rendering we do synchronously is attaching an ID to the cell (column ID + record ID)
        var id = me.getId() + '-' + record.getId();
        metaData.tdAttr = 'id="' + id + '"';

        // Asynchronously draw the sparkline.  We can't do it synchronously because: 
        // 1) this render method's HTML is buffered, not appended to the DOM immediately, and 
        // 2) it's not performance for more than 10 rows (especially in IE)
        if (!me.syncQueueData[id]) {
            me.syncQueue.push(id);
        }
        me.syncQueueData[id] = value;
        me.setSyncTimer();
        return '';
    },

    /** @Override */
    destroy: function() {
        clearTimeout(me.syncTimer);
        this.callParent(arguments);
    },
    
    /**
     * @private
     * 
     * Ensures a timer is set to render all pending sparklines as soon as this thread completes its work.
     */
    setSyncTimer: function() {
        var me = this;
        if (!me.syncTimer) {
            me.syncTimer = setTimeout(function() {
                me.renderFromQueue();
            }, 0);
        }
    },

    /**
     * @private
     * 
     * Renders sparklines that need to be (re)drawn based on what's in the queue. To avoid noticeable lag, only a subset of
     * the queued items (which are processed in FIFO order) may be processed. If not all items are rendered, setSyncTimer is
     * called to process the remaining items as soon as this thread completes its work. (This allows the browser to process
     * user-initiated UI events before we resume rendering sparklines.)
     */
    renderFromQueue: function() {
        var me = this;
        var i = 0;
        delete me.syncTimer;

        var max = (me.globalMaxDataIndex) ? me.up('grid').getStore().max(me.globalMaxDataIndex) : undefined;

        // Limit the amount of rendering at one time to ensure the browser (especially IE) remains responsive
        for (i = 0; i < 10 && i < me.syncQueue.length; i++) {
            var id = me.syncQueue[i];
            var value = me.syncQueueData[id];
            var config = me.sparklineConfig;
            delete me.syncQueueData[id];
            
            if (!me.sparklineConfig) {
                config = value[1];
                value = value[0];
            }
            
            if (me.globalMaxDataIndex) {
                config.chartRangeMax = max;
            }
            
            $('#' + id).sparkline(value, config);
        }
        me.syncQueue.splice(0, i);
        if (me.syncQueue.length > 0) {
            me.setSyncTimer();
        }
    }
});
