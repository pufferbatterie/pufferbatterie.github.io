/**
 * Copyright (c) 2019 by Hughie Wilmshurst (https://codepen.io/HughieW/pen/MwBNNV)
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall
 * be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */
(function($){
    $.fn.radar_chart = function(options){

        canvasWidth = $('body').innerWidth() * 0.8;

        var settings = $.extend({
            colors: [
                '#dcdedc',
                '#ed6d63'
            ],
            lineWidth: canvasWidth/800,
            lineColor: '#ececec',
            textColor: '#353535'
        }, options);

        $(this).each(function(){
            var table = this;

            if(table.tagName.toUpperCase() == 'TABLE'){
                table.radar = {
                    attributes: [],
                    records: []
                }

                // add all the attributes
                $(table).find('thead th, thead td').each(function(){
                    table.radar.attributes.push(this.innerHTML);
                });

                // add all the values
                $(table).find('tbody tr').each(function(){
                    var record = {};
                    var $tds = $(this).find('td');

                    var i = 0;

                    $tds.each(function(){
                        record[i] = parseFloat(this.innerHTML);
                        i++;
                    });

                    table.radar.records.push(record);
                });

                // set up the canvas
                table.radar.canvas = document.createElement('canvas');
                table.radar.canvas.width = canvasWidth;
                table.radar.canvas.height = canvasWidth * 0.75;
                table.radar.canvas.style.border = "1px solid black";
                table.radar.canvas.style.display = "block";
                table.radar.canvas.style.margin = "0 auto";

                table.radar.ctx = table.radar.canvas.getContext('2d');

                radar_redraw(table);

                $(table.radar.canvas).insertAfter(table);
                $(table).hide();
            }
        });

        function radar_redraw(table){
            if(table.radar.ctx){
                table.radar.ctx.clearRect(0, 0, table.radar.canvas.width, table.radar.canvas.height);

                var geometry = {
                    centre: {
                        x: table.radar.canvas.width / 2,
                        y: table.radar.canvas.height / 2
                    },
                    radius: Math.min(table.radar.canvas.width / 3, table.radar.canvas.height / 3),
                    text_radius: Math.min(table.radar.canvas.width / 2.8, table.radar.canvas.height / 2.8)
                };

                // grid

                table.radar.ctx.beginPath();

                for(var i = 0; i < 360; i+=(360 / table.radar.attributes.length)){
                    var angle = 90 - i;

                    table.radar.ctx.moveTo(geometry.centre.x, geometry.centre.y);
                    table.radar.ctx.lineWidth = settings.lineWidth;
                    table.radar.ctx.strokeStyle = settings.lineColor;
                    table.radar.ctx.lineTo(geometry.centre.x + geometry.radius * Math.cos(angle * Math.PI / 180), geometry.centre.y - geometry.radius * Math.sin(angle * Math.PI / 180));
                }

                var segments = 3;

                for(var a = 1; a <= segments; a++){
                    table.radar.ctx.moveTo(geometry.centre.x + (geometry.radius / segments * a) * Math.cos(90 * Math.PI / 180), geometry.centre.y - (geometry.radius / segments * a) * Math.sin(90 * Math.PI / 180));

                    for(var i = 0; i <= 360; i+=(360 / table.radar.attributes.length)){
                        var angle = 90 - i;
                        table.radar.ctx.lineTo(geometry.centre.x + (geometry.radius / segments * a) * Math.cos(angle * Math.PI / 180), geometry.centre.y - (geometry.radius / segments * a) * Math.sin(angle * Math.PI / 180));
                    }
                }

                table.radar.ctx.stroke();

                // data

                table.radar.ctx.globalCompositeOperation = 'multiply';

                for(var r in table.radar.records){
                    table.radar.ctx.beginPath();

                    for(var i in table.radar.records[r]){
                        var angle = 90 - (360 / table.radar.attributes.length * i);

                        if(i == 0){
                            table.radar.ctx.moveTo(geometry.centre.x + (geometry.radius * table.radar.records[r][i] / 100) * Math.cos(angle * Math.PI / 180), geometry.centre.y - (geometry.radius * table.radar.records[r][i] / 100) * Math.sin(angle * Math.PI / 180));
                        }else{
                            table.radar.ctx.lineTo(geometry.centre.x + (geometry.radius * table.radar.records[r][i] / 100) * Math.cos(angle * Math.PI / 180), geometry.centre.y - (geometry.radius * table.radar.records[r][i] / 100) * Math.sin(angle * Math.PI / 180));
                        }
                    }

                    var t = r;
                    while(t >= settings.colors.length){
                        t -= settings.colors.length;
                    }

                    table.radar.ctx.fillStyle = settings.colors[t];
                    table.radar.ctx.fill();
                }

                table.radar.ctx.globalCompositeOperation = 'source-over';

                // text

                table.radar.ctx.font = 'normal normal 600 ' + canvasWidth/60 + 'px Lato';
                table.radar.ctx.textAlign = 'center';
                table.radar.ctx.textBaseline = 'middle';
                table.radar.ctx.fillStyle = settings.textColor;

                for(var i in table.radar.attributes){
                    var angle = 90 - (360 / table.radar.attributes.length * i);
                    if(angle < 0){ angle+=360; }

                    var dx = geometry.text_radius * Math.cos(angle * Math.PI / 180);
                    var dy = geometry.text_radius * Math.sin(angle * Math.PI / 180);

                    if(angle <= 80){
                        table.radar.ctx.textAlign = 'left';
                    }else if(angle <= 100){
                        table.radar.ctx.textAlign = 'center';
                    }else if(angle <= 260){
                        table.radar.ctx.textAlign = 'right';
                    }else if(angle <= 280){
                        table.radar.ctx.textAlign = 'center';
                    }else {
                        table.radar.ctx.textAlign = 'left';
                    }

                    table.radar.ctx.fillText(table.radar.attributes[i].toUpperCase().split('').join(String.fromCharCode(160)), geometry.centre.x + dx, geometry.centre.y - dy);
                }
            }
        }
    };

})(window.jQuery);