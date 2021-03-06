jQuery(function($) {
    'use strict';

    var instance = new (function($) {

        var Request = function() {
            var DEFAULT_QUEUE_NAME = "default";

            var named = { };

            var dfd = null;
            var defaults = {
                url: ""
            };

            // console.log(named);

            this.resolveNext = function(queue) {

                if (queue.length > 0) {
                    var dfd = queue.shift();

                    // console.log(dfd);

                    dfd.resolve();
                }
            };

            this.send = function(settings, callback, queueName){

                if (queueName == null) {

                    queueName = DEFAULT_QUEUE_NAME;
                }

                named[queueName] = named[queueName] || [];

                var queue = named[queueName];
                var $this = this;
                var dfd = null;

                console.log(queue.length, queueName);

                settings = $.extend({}, defaults, settings);

                if (settings.url == null) {

                    console.log("url is null");

                    // XXX do not send $.ajax()
                    dfd = $.Deferred().done(function(r) {

                        console.log("calling callback ...");

                        try {
                            callback(r);
                        } catch (e) {
                            queue.splice(0, queue.length);
                            throw e;
                        }

                        console.log("resolving next ...");
                        $this.resolveNext(queue);
                    });
                } else {

                    dfd = $.Deferred().done(function() {

                        console.log("sending $.ajax request ...");

                        $.ajax(settings).done(function(r) {

                            console.log("calling callback ...");

                            try {
                                callback(r);
                            } catch (e) {
                                queue.splice(0, queue.length);
                                throw e;
                            }

                            console.log("callback called!");

                            console.log("resolving next ...");
                            $this.resolveNext(queue);
                        });
                    });
                }

                queue.push(dfd);

                if (queue.length == 1) {

                    console.log("length == 1, resolving...");
                    setTimeout(
                        function() {

                            $this.resolveNext(queue);

                            console.log("resolved!");
                        }, 1000);
                    
                }
            };
        };

        return Request;
    }($));

    return function() {
        var i = 1;
        var output = $('#output');
        var workload = parseInt($('#workload').val());

        function doSomeHardWork() {

            output.val('');

            for (var i = 0; i < workload; i++) {

                output.val(output.val() + "\n" + i);
            }

            console.log("finished workload, uff!");
        }

        $('#send').submit(function(e) {
            var $url = null;
            e.preventDefault();

            instance.send(
                { data: { current : i }, url: $url },
                function(r) {
                    console.log(r);
                    doSomeHardWork();
                    console.log('aqui ' + (i++) + ' ...');

                    if (i % 2 == 0) throw 'error';
                });

            instance.send(
                { data: { current : i }, url: $url },
                function(r) {
                    console.log(r);
                    doSomeHardWork();
                    console.log('aqui ' + (i++) + ' ...');

                    if (i % 2 == 0) throw 'error';
                });
        });
    };
}(jQuery));

