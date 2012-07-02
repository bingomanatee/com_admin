$(function () {

    /* ***************** HELPERS ******************** */


    Handlebars.registerHelper('id_short', function (id) {
        return id.slice(0, 8) + '...'
    });

    Handlebars.registerHelper('id_display', function (id) {
        var ida = [
            id.slice(0, 4),
            id.slice(4, 8),
            id.slice(8, 12),
            id.slice(12, 16),
            id.slice(16, 20),
            id.slice(20)
        ]
        return  ida.join('-');
    });

    var data_type_options =
        [
            {value: 'string', label: 'String'},
            {value: 'number', label: 'Number'},
            {value: 'date', label: 'Date'}

        ];

    var options_render = Handlebars.compile('{{#each options }}' +
        '<option value="{{ value }}" ' +
        '{{#if selected }} ' +
        ' selected="selected" ' +
        '{{/if }} >' +
        '{{label }}' +
        '</option>{{/each }}');
    Handlebars.registerHelper('data_type_options', function(option){
        var sdo = _.map(data_type_options, function(o){
            var out = {selected:o.value == option};
            _.extend(out, o);
            return out;
        })
        return new Handlebars.SafeString(options_render({options: sdo}));
    })

    /* ****************** MODEL ********************** */

    var Config_Template_Model = Backbone.Model.extend({
        defaults:{
            name:'',
            component:'',
            data_type:'string',
            default:''
        },
        urlRoot:'/admin/config_template',
        idAttribute:'_id'
    })

    var Config_Template_Coll = Backbone.Collection.extend({
        model:Config_Template_Model
    })

    /* ****************** MAIN VIEW **************** */

    function _comp(c1, c2) {
        if (c1 > c2) {
            return 1;
        } else if (c1 < c2) {
            return -1;
        } else {
            return 0;
        }
    }

    function comp(c1, c2) {
        var c = _comp(c1.get('component'), c2.get('component'));

        if (c == 0){
            return _comp(c1.get('name'), c2.get('name'));
        } else {
            return c;
        }
    }

    var Configs_View = Backbone.View.extend({

        collection:new Config_Template_Coll(),

        el:$("#config_template_list"),

        initialize:function () {
            var self = this;
            this.collection.url = '/admin/config_template';
            this.collection.comparator = comp;
            this.update_coll(false, function () {
                self.render();
            });
        },

        render:function () {

            var self = this;
            $('tbody', this.$el).empty();
            //    this.$el.removeClass();
            //  this.$el.addClass('comp_' + this.comp_field);
            /*  var filtered_models = _.filter(
             this.collection.models,
             function (m) {
             return self._filter_model(m);
             }
             ) */
            this.collection.each(function (m) {
                self.render_config(m);
            }, this);

        },

        render_config:function (config) {
            var v = new RowView({
                model:config
            });
            $('tbody', this.$el).append(v.render().el);
        },

        events:{
            'click button.add':'add_config',
            'click button.edit':'edit_config'
        },

        _ct_form:false,

        add_config:function () {
            console.log('add config');
            if (!this._new_ct_form) {
                this._new_ct_form = new AddConfigView({configs_view:this}).render();
            }
            this._new_ct_form.show_dialog(true);
        },

        edit_config:function () {
            console.log('edit config');
            if (!this._new_ct_form) {
                this._new_ct_form = new EditConfigView({configs_view:this}).render();
            }
            this._new_ct_form.show_dialog(true);
        },
        
        update_coll:function (no_fetch, callback) {
            var self = this;

            function _update() {
                self.collection.sort();
                if (callback) {
                    callback();
                }
            }

            if (no_fetch) {
                _update();
            } else {
                this.collection.fetch({success:_update});
            }
        }


    })

    var configs_view = new Configs_View();
    configs_view.render();

    /* ******************* ROW VIEW *************** */

    var tmpl = $("#config_list_template").html();
    var row_tmpl = Handlebars.compile(tmpl);

    var RowView = Backbone.View.extend({
        tagName:'tr',
        className:'',
        template:row_tmpl,

        render:function () {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

        events:{
            'click button.edit':'edit_config',
            'mouseover td.id_value':'show_id',
            'mouseout td.id_value':'hide_id'
        },

        hide_id:function () {
            $('.full_id', this.$el).hide();
        },

        show_id:function () {
            $('.full_id', this.$el).show();
        },

        edit_config:function (n) {
            console.log('edit menu: ', n, this, this.model);
            var mfv = new EditConfigView({model:this.model});
            mfv.render();
        }

    })

    /* -------------- ADD FORM VIEW ------------- */

    var AddConfigView = Backbone.View.extend({
        el:$('#add_config'),


        events:{
            'click button.new':'new_config'
        },

        new_config:function (e) {
            var fd = $('form', this.$el).serializeArray();
            var model = new Config_Template_Model();

            _fd_to_model(fd, model);

            model.save({}, {
                success:function () {
                    configs_view.collection.fetch({
                        success:function () {
                            configs_view.render();
                        }
                    });
                }
            });
            this.show_dialog(false);
            return false;
        },

        template:Handlebars.compile(
            $("#add_config_form").html()),

        render:function () {
            //  console.log('rendering form for ', this.model);
            this.$el.html(this.template({}));
            this.show_dialog(true);
            return this;
        },

        show_dialog:function (s) {
            if (s) {
                $(this.$el).dialog({title:"Add Configuration", width:"30em"});
            } else {
                $(this.$el).dialog('close');
            }

        }

    })

    function _fd_to_model(fd, model) {
        _.each(fd, function (d) {
            switch (d.name) {
                case 'name':
                    model.set('name', d.value);
                    break;

                case 'component':
                    model.set('component', d.value);
                    break;

                case 'data_type':
                    model.set('data_type', d.value);
                    break;

                case 'default':
                    model.set('default', d.value);
                    break;

            }
        });
    }
    /* -------------- EDIT VIEW ------------- */

    var EditConfigView = Backbone.View.extend({
        el:$('#edit_config'),


        events:{
            'click button.update':'update_config'
        },

        update_config:function (e) {
            var fd = $('form', this.$el).serializeArray();
            var self = this;
            _fd_to_model(fd, this.model);

            this.model.save({}, {
                success:function () {
                    configs_view.update_coll(true, function () {
                        $(self.$el).dialog('close');
                        configs_view.render();
                    });
                }
            });
            this.show_dialog(false);
            return false;
        },

        template:Handlebars.compile(
            $("#edit_config_form").html()),

        render:function () {
            var data = this.model.toJSON();
            this.$el.html(this.template(data));
            this.show_dialog(true);
            return this;
        },

        show_dialog:function (s) {
            if (s) {
                $(this.$el).dialog({title:"Add Configuration", width:"30em"});
            } else {
                $(this.$el).dialog('close');
            }

        }

    })

})