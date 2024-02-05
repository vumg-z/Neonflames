var particles = [],
    color = 'rgb(0, 25, 0)',
    composite = 'lighter',
    max_age = 20,
    initial_radius = 4,
    lineWidth = 3.0,
    noiseCanvas = makeOctaveNoise(canvas.width, canvas.height, 8),
    noise = noiseCanvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;

function clear(){
    _gaq.push(['_trackEvent', 'neonfuzz', 'clear']);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function download(){
    _gaq.push(['_trackEvent', 'neonfuzz', 'download']);
    window.open(canvas.toDataURL('image/jpeg', 0.9))
}

function share(){
    _gaq.push(['_trackEvent', 'neonfuzz', 'share']);


    try {
        var img = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
    } catch(e) {
        var img = canvas.toDataURL().split(',')[1];
    }
    var w = window.open();
    w.document.write('Uploading...');
    $.ajax({
        url: 'http://api.imgur.com/2/upload.json',
        type: 'POST',
        data: {
            type: 'base64',
            key: '48c16073663cb7d3befd1c2c064dfa0d',
            name: 'neon.jpg',
            title: 'test title',
            caption: 'test caption',
            image: img
        },
        dataType: 'json'
    }).success(function(data) {
        w.location.href = data['upload']['links']['imgur_page'];
    }).error(function() {
        alert('Could not reach api.imgur.com. Sorry :(');
        w.close();
    });
}

function getNoise(x, y, channel) {
    //return fuzzy(0.4);
    return noise[(~~x+~~y*canvas.width)*4+channel]/127-1.0;
}

// base +/- range
function fuzzy(range, base){
    return (base||0) + (Math.random()-0.5)*range*2
}

timer.ontick = function(td){
    if(input.mouse.down){
        for(var i = 0; i < 10; i++){
            particles.push({
                vx: fuzzy(10.0),
                vy: fuzzy(10.0),
                x: input.mouse.x,
                y: input.mouse.y,
                age: 0
            });
        }
    }

    // Automatically add particles if the total count is below a certain number, for example, 100
    if (particles.length < 100) {
        for (var i = 0; i < 10; i++) {
            particles.push({
                vx: fuzzy(5.0),
                vy: fuzzy(5.0),
                x: Math.random() * canvas.width, // Random x position within the canvas
                y: Math.random() * canvas.height, // Random y position within the canvas
                age: Math.random() * canvas.height 
            });
        }
    }


    ctx.lineWidth = 12;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = composite;
    var alive = [];

    for(var i = 0; i < particles.length; i++){
        var p = particles[i];
        p.vx = p.vx*.1 + getNoise(p.x, p.y, 0)*4 ; //+fuzzy(1.0);
        p.vy = p.vy*.1+ getNoise(p.x, p.y, 1)*4  ; //+fuzzy(1.0);
        p.x += p.vx;
        p.y += p.vy;
        p.age ++;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI, true);
        ctx.closePath();
        ctx.fill();
        //ctx.stroke();
        
        if(p.age < max_age){
            alive.push(p);
        }
    }

    particles = alive;
}

ctx.fillStyle = 'black';
ctx.fillRect(0, 0, canvas.width, canvas.height);

$('#colors li').click(function() {
    $('#colors li').removeClass('active');
    $(this).addClass('active');
});
