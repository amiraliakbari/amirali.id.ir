var almizaan = {
    chapterId: 0,
    sectionId: 0,
    subsectionId: 0,
    prevSection: -1,
    eos: false
};

function fixSizing() {
    $('#text').height(window.innerHeight - $('#window').position().top - 5);
}

function listenForHash() {
    var m = window.location.hash.match(/^#g(\d+)-(\d+)$/);
    if (m) {
        loadSection(m[1], m[2]);
    }
}

function toPersianNumber(s) {
    s = s.toString();
    var p = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    var r = '';
    for (var i = 0; i < s.length; i++) {
        r += p[parseInt(s[i], 10)];
    }
    return r;
}

function loadSection(chapterId, sectionId) {
    chapterId = parseInt(chapterId, 10);
    sectionId = parseInt(sectionId, 10);
    if (almizaan.chapterId === chapterId && almizaan.sectionId == sectionId) {
        return;
    }
    if (chapterId < 0 || chapterId > 114) {
        return;
    }

    var id = chapterId + '-' + sectionId;
    NProgress.start();
    $.ajax({
        method: 'get',
        url: 'dist/' + id + '.json'
    })
        .done(function (r) {
            $('#top-nav h1').html(r.chapter + ' <small>' + r.section + '</small>');

            var i;
            var verses = '';
            for (i = 0; i < r.verses.length; i++) {
                var v = r.verses[i];
                verses += '<span>' + v;
                if (r.versesOffset) {
                    verses += ' <span class="badge">' + toPersianNumber(r.versesOffset + i) + '</span>';
                }
                verses += '</span>&nbsp;&nbsp;';
            }
            $('#text-ar').html(verses);

            var sections = '';
            var content = '';
            for (i = 0; i < r.subsections.length; i++) {
                var ss = r.subsections[i];
                var sid = 'text-section' + i;
                sections += '<li><a href="#' + sid + '">' + ss.title + '</a></li>';
                content += '<div id="' + sid + '"><h2>' + ss.title + '</h2>' + ss.text + '</div>';
            }
            $('#text').html(content);
            $('#sections-nav ul').html(sections);

            almizaan.chapterId = chapterId;
            almizaan.sectionId = sectionId;
            almizaan.eos = !!(r.eos);
            almizaan.prevSection = r.prevSection || -1;
            window.location.href = '#g' + chapterId + '-' + sectionId;
        })
        .fail(function () {
            alert('متاسفانه این بخش در پایگاه داده وجود ندارد.');
        })
        .always(function () {
            NProgress.done();
        });
}

function loadPrevSection() {
    var s = almizaan.sectionId - 1;
    var c = almizaan.chapterId;
    if (s === 0) {
        s = almizaan.prevSection || 1;
        c -= 1;
    }
    loadSection(c, s);
}

function loadNextSection() {
    var s = almizaan.sectionId + 1;
    var c = almizaan.chapterId;
    if (almizaan.eos) {
        s = 1;
        c += 1;
    }
    loadSection(c, s);
}

$(function () {
    fixSizing();
    listenForHash();
    setInterval(fixSizing, 3000);
    $(window).on('hashchange', listenForHash);
    $('#prevSectionBtn').click(function () {loadPrevSection()});
    $('#nextSectionBtn').click(function () {loadNextSection()});

    var h = window.location.hash;
    if (h === '' || h === '#' || h.substr(0, 2) !== '#g') {
        loadSection(0, 1);
    }
});
