<script>
    function tTime(s) {
        s = Math.round(s);
        var h = Math.floor(s / 3600);
        s -= h * 3600;
        var m = Math.floor(s / 60);
        s -= m * 60;
        return (m < 10 ? m : m) + ":" + (s < 10 ? '0' + s : s);
    }

    function diff(a, b) {
        return Math.abs(a - b);
    }

    function currProg(s) {
        var total = $("#progress-bar").prop('max');
        var current = $("#progress-bar").val();
        return ((100 / total) * current);
    }

    function currVol(s) {
        var total = $("#volume-bar").prop('max');
        var current = $("#volume-bar").val();
        return ((100 / total) * current);
    }

    function create_style(css) {
        head = document.head,
            oldstyles = head.querySelector("#rangestyle"),
            style = document.createElement('style');
        if (oldstyles != null) {
            oldstyles.remove();
        }
        style.id = "rangestyle";
        head.appendChild(style);

        style.type = 'text/css';
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
    }

    function create_style2(css2) {
        head2 = document.head,
            oldstyles2 = head2.querySelector("#rangestyle2"),
            style2 = document.createElement('style');
        if (oldstyles2 != null) {
            oldstyles2.remove();
        }
        style2.id = "rangestyle2";
        head2.appendChild(style2);

        style2.type = 'text/css';
        if (style2.styleSheet) {
            style2.styleSheet.cssText = css2;
        } else {
            style2.appendChild(document.createTextNode(css2));
        }
    }

    var audio;
    var playing = false;
    var played = false;
    var lyric = $('#lyrics');

    function loadAudio() {
        audio.trigger('load');
    }

    function toggleAudio() {
        if (!played) {
            lyric = $('#lyrics').marquee({
                duration: 166000,
                gap: 5,
                speed: 4,
                delayBeforeStart: 0,
                direction: 'up',
                duplicated: true,
                startVisible: true
            });
            $(".visualizer").fadeIn();
            played = true;
        }
        if (playing) {
            pauseAudio();
        } else {
            playAudio();
        }
    }

    function playAudio() {
        var clink = $('.running').attr('href');
        let random = Math.random().toString(36).slice(2, 7);
        audio.attr('src',clink+'?tag='+random);

        audio.trigger('play');
        playing = true;
        if ($("button.pauseplay i").hasClass("fa-play"))
            $("button.pauseplay i").toggleClass("fa-play fa-pause");
        lyric.marquee("resume");
        $(".visualizer").fadeIn().toggleClass("paused playing");
    }

    function pauseAudio() {
        audio.trigger('pause');
        playing = false;
        $("button.pauseplay i").toggleClass("fa-pause fa-play").removeClass("active");
        lyric.marquee("pause");
        $(".visualizer").toggleClass("playing paused");
    }

    function stopAudio() {
        audio.trigger('pause');
        $("button.pauseplay i").toggleClass("fa-play fa-pause").removeClass("active");
        audio.prop("currentTime", 0);
        $("lyrics").marquee("pause");
        $("lyrics").marquee("destroy");
        lyric = $('#lyrics').marquee({
            duration: 166000,
            gap: 5,
            delayBeforeStart: 0,
            direction: 'up',
            duplicated: true,
            startVisible: true
        }).marquee("pause");
        $(".visualizer").fadeOut().toggleClass("playing paused");
    }

    function forwardAudio() {
        if (playing) {
            pauseAudio();
            audio.prop("currentTime", audio.prop("currentTime") + 5);
            playAudio();
        } else {
            stopAudio();
            playAudio();
        }
    }

    function backAudio() {
        if (playing) {
            pauseAudio();
            audio.prop("currentTime", audio.prop("currentTime") - 5);
            playAudio();
        } else {
            stopAudio();
            playAudio();
        }
    }

    function volumeUp() {
        var volume = audio.prop("volume") + 0.01;
        if (volume > 1) {
            volume = 1;
        }
        audio.prop("volume", volume);
    }

    function volumeDown() {
        var volume = audio.prop("volume") - 0.01;
        if (volume < 0) {
            volume = 0;
        }
        audio.prop("volume", volume);
    }

    function volumeChange(percent) {
        var volume = $("#volume-bar").val();
        if (volume == 100) {
            volume = 1;
        } else if (volume <= 9) {
            volume = "0.0" + volume;
        } else {
            volume = "0." + volume;
        }
        audio.prop("volume", volume);
    }

    function toggleMuteAudio() {
        audio.prop("muted", !audio.prop("muted"));
    }

    function addEventHandlers() {
        $("button.forward").click(forwardAudio);
        $("button.backward").click(backAudio);
        $("button.pauseplay").click(toggleAudio);
    }

    $(document).ready(function () {

        var seeking = false;

        audio = $("#song");
        addEventHandlers();
        lyric.marquee("pause");

        $("#song").on("timeupdate", function (e) {
            $('#elapsed').html(tTime(document.getElementById("song").currentTime));
            if (!seeking) {
                $("#progress-bar").val(audio.prop("currentTime"));
                //$('#remaining').html(tTime(diff(audio.prop("duration"), audio.prop("currentTime"))));
                $('#remaining').html('Live');
                var val = Math.round(currProg($("#progress-bar").val()));
                if ((val >= 90) && (val <= 99)) val = (val - 1);
                create_style("#progress input[type=range]::-webkit-slider-runnable-track { background: linear-gradient(90deg, rgba(218,80,25,1) 0%, rgba(184,160,34,1) " + val + "%, #1D2021 " + val + "%, #1D2021 100%) !important;}");
                if (navigator.userAgent.indexOf("Firefox") != -1) {
                    create_style("#progress input[type=range]::-moz-range-track { background: linear-gradient(90deg, rgba(218,80,25,1) 0%, rgba(184,160,34,1) " + val + "%, #1D2021 " + val + "%, #1D2021 100%) !important;}");
                }
            }
        });
        $("#song").on("ended", function (e) {
            stopAudio();
        });

        $("#progress-bar").on("mousedown", function (event) {
            seeking = true;
            seek(event);
            pauseAudio();
            lyric.marquee("pause");
        });

        $("#progress-bar").on("mousemove", function (event) {
            seek(event);
        });
        $("#progress-bar").on("mouseup", function () {
            seeking = false;
            audio.prop("currentTime", $("#progress-bar").val());
            playAudio();
            lyric.marquee("resume");
        });

        function seek(event) {
            if (seeking) {
                audio.prop("currentTime", $("#progress-bar").val());
            }
        }

        $(document).on('input', '#progress-bar', function () {
            //$('#remaining').html(tTime(diff(audio.prop("duration"), $("#progress-bar").val())));
            $('#remaining').html('Live');
            var val = Math.round(currProg($(this).val()));
            if (val == 98) val = 97;
            create_style("#progress input[type=range]::-webkit-slider-runnable-track { background: linear-gradient(90deg, rgba(218,80,25,1) 0%, rgba(184,160,34,1) " + val + "%, #1D2021 " + val + "%, #1D2021 100%) !important;}");
            if (navigator.userAgent.indexOf("Firefox") != -1) {
                create_style("#progress input[type=range]::-moz-range-track { background: linear-gradient(90deg, rgba(218,80,25,1) 0%, rgba(184,160,34,1) " + val + "%, #1D2021 " + val + "%, #1D2021 100%) !important;}");
            }
        });
        $(document).on('input', '#volume-bar', function () {
            var val2 = Math.round(currVol($("#volume-bar").val()));
            volumeChange(val2);
            create_style2("#top-row input[type=range]::-webkit-slider-runnable-track { background: linear-gradient(90deg, rgba(218,80,25,1) 0%, rgba(184,160,34,1) " + val2 + "%, #1D2021 " + val2 + "%, #1D2021 100%) !important;}");
            if (navigator.userAgent.indexOf("Firefox") != -1) {
                create_style2("#top-row input[type=range]::-moz-range-track { background: linear-gradient(90deg, rgba(218,80,25,1) 0%, rgba(184,160,34,1) " + val2 + "%, #1D2021 " + val2 + "%, #1D2021 100%) !important;}");
            }
        });

    });


    UpdatePlayer()
    var intervalId = window.setInterval(function () {
        UpdatePlayer()
    }, 5000);

    function UpdatePlayer() {
        var flag = 0
        axios.post('https://radio.vstartv.org' + '/api/player', {
            port: 8691,
        }).then((response) => {
            if (response.data.status === 'success') {
                UpdateMeta(response.data.data.track)
            }
        })
    }

    function UpdateMeta(track) {
        axios.post('https://radio.vstartv.org' + '/api/update-player-meta', {
            track: track,
            port: 8691,
        }).then((response) => {
            if (response.data.status === 'success') {

                // if(response.data.current_track['api_image'] == null || response.data.current_track['api_image'] == ""){
                //     $('.online').attr('src', response.data.current_track['image']);
                // }else{
                //     $('.online').attr('src', response.data.current_track['api_image']);
                // }


                if (response.data.current_track['image'] != null){
                    let lastPart = response.data.current_track.image.split("/").pop();
                    if (lastPart === "track-icon.png") {
                        if( response.data.current_track != null &&  response.data.current_track.api_image != null){
                            $('.online').attr('src', response.data.current_track.api_image);
                        }else{
                            $('.online').attr('src', response.data.current_track.image);
                        }
                    } else {
                        $('.online').attr('src', response.data.current_track.image);
                    }
                }else if(response.data.deezer != null){
                    $('.online').attr('src', response.data.deezer.album['cover_medium']);
                }

                if(response.data.current_track['api_title'] == null || response.data.current_track['api_title'] == ""){
                    $("#track-title").html(response.data.current_track['title']);
                }else{
                    $("#track-title").html(response.data.current_track['api_title']);
                }

                if(response.data.current_track['api_album'] == null || response.data.current_track['api_album'] == ""){
                    $("#track-album").html(response.data.current_track['album']);
                }else{
                    $("#track-album").html(response.data.current_track['api_album']);
                }

                if(response.data.current_track['api_artist'] == null || response.data.current_track['api_artist'] == ""){
                    $("#track-artist").html(response.data.current_track['artist']);
                }else{
                    $("#track-artist").html(response.data.current_track['api_artist']);
                }


            }
            RePlayLink()
        })
    }

    function RePlayLink() {
        console.log('check')
        audio.on("ended", function() {
            console.log('ended')
            var clink = $('.running').attr('href');
            let random = Math.random().toString(36).slice(2, 7);
            audio.attr('src',clink+'?tag='+random);
            audio.trigger('play');
            playing = true;
            if ($("button.pauseplay i").hasClass("fa-play"))
                $("button.pauseplay i").toggleClass("fa-play fa-pause");
            lyric.marquee("resume");
            $(".visualizer").fadeIn().toggleClass("paused playing");
        });
        audio.on("error", function() {
            console.log('error')
            var clink = $('.running').attr('href');
            let random = Math.random().toString(36).slice(2, 7);
            audio.attr('src',clink+'?tag='+random);
            audio.trigger('play');
            playing = true;
            if ($("button.pauseplay i").hasClass("fa-play"))
                $("button.pauseplay i").toggleClass("fa-play fa-pause");
            lyric.marquee("resume");
            $(".visualizer").fadeIn().toggleClass("paused playing");
        });
    }

    $('.channel-link').click(function (e){
        e.preventDefault();
        var thisclass = $(this);
        $('.channel-link').removeClass('running');
        thisclass.addClass('running');
        var link = thisclass.attr('href');
        let random = Math.random().toString(36).slice(2, 7);
        audio.attr('src',link+'?tag='+random);
        stopAudio();
        playAudio();
    });
</script>
