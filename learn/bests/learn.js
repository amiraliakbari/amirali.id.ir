var resources = {
    js: [
        // 'Inheritance and the Prototype Chain', ['https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain'], 'The basic of JS OOP model, introducing the prototype chain'
        {
            id:'4.1',
            section: 'OOP',
            title: 'Working with Objects',
            level: 'Intermidiate',
            importance: 'Must Read',
            links: ['https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_Objects'],
            description: 'Very useful introduction to objects in JS',
            notes: "Don't forget to use a browser's JS console to practice creating and modifying objects, and try all the codes yourself while reading the article."
        },
        {
            id:'4.2',
            section: 'OOP',
            title: 'Simple JavaScript Inheritance',
            level: 'Intermediate +',
            importance: 'Must Read',
            links: ['http://ejohn.org/blog/simple-javascript-inheritance/'],
            description: 'One of the best techniques to have class-based OOP behavior in JS',
            notes: "Its OK if you don't understand the implementation code (second code block in the article), the important thing is to be able to use this class defining approach (Class.extend/etc.) in your code, as well as a general understanding of what the implementation code is trying to solve."
        },
        {
            id:'6.2',
            section: 'Events',
            title: 'Href attribute for JavaScript links: “#” or “javascript:void(0)”?',
            level: 'Intermediate',
            importance: 'Useful',
            links: ['http://stackoverflow.com/a/138233/462865'],
            description: 'I always wondered what is that javascript:void(0) before reading this!',
            notes: "But remember that is technique is only useful for ajax web Apps, and maybe not even for those! The link is useful because it explains all things, not for the technique itself."
        }
    ],
    web: [
        {
            id:'6.1',
            section: 'Validation',
            title: 'Free email validation API for web forms',
            level: 'Intermediate',
            importance: 'Useful',
            links: ['http://blog.mailgun.com/post/free-email-validation-api-for-web-forms/'],
            description: 'A free web service to precisely validating emails',
            notes: "Read it to realize why you can't do it yourself!"
        }
    ],
    frontend: [
        {
            id:'1.1',
            section: 'HTML',
            title: 'Introduction to HTML',
            level: 'Elementary',
            importance: 'Must Read',
            links: ['https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Introduction'],
            description: 'A good overall view of HTML',
            notes: ""
        },
        {
            id:'1.2',
            section: 'HTML',
            title: 'HTML Beginner Tutorial',
            level: 'Elementary',
            importance: 'Must Read',
            links: ['http://www.htmldog.com/guides/html/beginner/'],
            description: 'A good comprehensive tutorial on HTML',
            notes: ""
        },
        {
            id:'2.1',
            section: 'CSS',
            title: 'CSS Beginner Tutorial',
            level: 'Elementary',
            importance: 'Must Read',
            links: ['http://www.htmldog.com/guides/css/beginner/'],
            description: 'A good elementary tutorial on CSS',
            notes: ""
        },
        {
            id:'2.2',
            section: 'CSS',
            title: 'The CSS Box Model',
            level: 'Elementary +',
            importance: 'Must Read',
            links: ['http://css-tricks.com/the-css-box-model/'],
            description: 'A good introduction to box model, with some very useful (and less known) facts',
            notes: ""
        },
        {
            id:'2.3',
            section: 'CSS',
            title: 'Killer Collection of CSS Resets',
            level: 'Intermediate',
            importance: 'Useful',
            links: ['http://perishablepress.com/a-killer-collection-of-global-css-reset-styles/'],
            description: 'Very good collection of CSS resets, including a useful introduction to CSS resets',
            notes: ""
        },
        {
            id:'2.4.1',
            section: 'CSS',
            title: 'Absolute, ... Positioning: How Do They Differ?',
            level: 'Intermediate',
            importance: 'Must Read',
            links: ['http://css-tricks.com/absolute-relative-fixed-positioining-how-do-they-differ/'],
            description: 'A medium sized answer on CSS positioning question',
            notes: ""
        },
        {
            id:'2.4.2',
            section: 'CSS',
            title: 'Absolute Positioning Inside Relative Positioning',
            level: 'Intermediate',
            importance: 'Must Read',
            links: ['http://css-tricks.com/absolute-positioning-inside-relative-positioning/'],
            description: 'A useful CSS technique for creating dialog close buttons, etc.',
            notes: ""
        },
        {
            id:'2.4.3',
            section: 'CSS',
            title: 'Learn CSS Positioning in Ten Steps',
            level: 'Intermediate',
            importance: 'Useful',
            links: ['http://www.barelyfitz.com/screencast/html-training/css/positioning/'],
            description: 'Good visualization of different position types',
            notes: "This tutorial examines the different layout properties available in CSS: position:static, position:relative, position:absolute, and float."
        },
        {
            id:'2.7.1',
            section: 'CSS',
            title: 'Twitter Bootstrap?',
            level: 'Intermediate',
            importance: 'Useful',
            links: ['http://getbootstrap.com/'],
            description: 'Easily build beautiful and responsive web site. Bootstrap is a UI framework with lots of useful features.',
            notes: ""
        },
        {
            id:'2.7.2',
            section: 'CSS',
            title: 'When to Use Bootstrap?',
            level: 'Intermediate+',
            importance: 'Useful',
            links: ['http://flippinawesome.org/2013/06/24/when-to-use-or-not-use-twitter-bootstrap/'],
            description: 'Has a nice decision graph',
            notes: ""
        },
        {
            id:'2.8',
            section: 'CSS',
            title: 'CSS Architecture',
            level: 'Intermediate+',
            importance: 'Must Read',
            links: ['http://engineering.appfolio.com/2012/11/16/css-architecture/'],
            description: 'Excellent!',
            notes: ""
        },
        {
            id:'3.1',
            section: 'HTML5',
            title: 'Five Things You Should Know About HTML5',
            level: 'Elementary',
            importance: 'Must Read',
            links: ['http://diveintohtml5.info/introduction.html'],
            description: 'What is HTML5 and how can I use it?',
            notes: ""
        },
        {
            id:'3.2',
            section: 'HTML5',
            title: 'Local Storage for Web Applications',
            level: 'Intermediate',
            importance: 'Useful',
            links: ['http://diveintohtml5.info/storage.html'],
            description: 'A must read if you need to store data on user computer',
            notes: ""
        }
    ],
    python: [
        {
            id:'5',
            section: 'Stdlib',
            title: 'Regular Expression HOWTO',
            level: 'Intermediate',
            importance: 'Must Read',
            links: ['http://docs.python.org/2/howto/regex.html'],
            description: "Don't tell me you haven't read this! Just put this for reference.",
            notes: ""
        },
        {
            id:'6',
            section: 'Techniques',
            title: 'Enum in Python',
            level: 'Intermediate',
            importance: 'Useful',
            links: ['http://stackoverflow.com/a/1695250/462865'],
            description: "Good if you are used to using enums (Note: in Django, just use model_utils.Choices)",
            notes: ""
        },
        {
            id:'7.3.1',
            section: 'Externals',
            title: 'The ElementTree XML API',
            level: 'Intermediate',
            importance: 'Must Read',
            links: ['http://docs.python.org/2/library/xml.etree.elementtree.html'],
            description: 'Everyone will someday need to parse XML, its in stdlib of course!',
            notes: ""
        },
        {
            id:'7.3.2',
            section: 'Externals',
            title: 'Beautiful Soup Documentation',
            level: 'Intermediate',
            importance: 'Useful',
            links: ['http://www.crummy.com/software/BeautifulSoup/bs4/doc/'],
            description: 'HTML and XML parsing library with good API. Especially useful if your input is not strictly valid.',
            notes: ""
        },
        {
            id:'7.3.3',
            section: 'Externals',
            title: 'xmltodict',
            level: 'Intermediate',
            importance: 'Useful',
            links: ['https://github.com/martinblech/xmltodict'],
            description: 'Tired of non-pythonic xml.*s? This is a nice try to solve this problem. Notable for its streaming support, otherwise I prefer Beautiful Soup.',
            notes: ""
        }
    ],
    django: [
        {
            id:'4.4',
            section: 'Templates',
            title: 'Custom template tags and filters',
            level: 'Intermediate',
            importance: 'Must Read',
            links: ['https://docs.djangoproject.com/en/dev/howto/custom-template-tags/'],
            description: "I can't count how many times I referred to this documentation page!",
            notes: ""
        },
        {
            id:'5.1',
            section: 'Auth',
            title: 'How to use sessions',
            level: 'Intermediate',
            importance: 'Useful',
            links: ['https://docs.djangoproject.com/en/dev/topics/http/sessions/'],
            description: 'Sessions are a great way to securely store user-specific values, say goodbye to old and unsafe cookies!',
            notes: "Try to find out how each session backend use DB/cookies/etc. to implement session behavior, and how safe/fast/scalable/etc. each is."
        }
    ],
    cs: [
        {
            id:'1.1.1',
            section: 'General',
            title: 'Favourite quote about programming?',
            level: 'Elementary',
            importance: 'Interesting',
            links: ['http://programmers.stackexchange.com/q/39'],
            description: 'Loved this!',
            notes: ""
        },
        {
            id:'1.2.1',
            section: 'Algorithms',
            title: 'Big-O notation explained...',
            level: 'Elementary',
            importance: 'Must Read',
            links: ['http://justin.abrah.ms/computer-science/big-o-notation-explained.html'],
            description: '',
            notes: ""
        },
        {
            id:'1.2.2',
            section: 'Algorithms',
            title: 'Big-O is easy to calculate, if you know how',
            level: 'Elementary',
            importance: 'Must Read',
            links: ['http://justin.abrah.ms/computer-science/how-to-calculate-big-o.html'],
            description: '',
            notes: ""
        },
        {
            id:'1.2.7',
            section: 'Algorithms',
            title: 'Research at Google',
            level: 'Advanced',
            importance: 'Interesting',
            links: ['http://research.google.com/pubs/papers.html'],
            description: 'There are some really good papers',
            notes: ""
        }
    ],
    tools: [
        {
            id:'2.2',
            section: 'Network',
            title: 'Open Port Check Tool',
            level: 'Elementary',
            importance: 'Useful',
            links: ['http://www.canyouseeme.org/'],
            description: 'Check for ISP/firewall/etc. blocked ports on your own servers',
            notes: ""
        }
    ],
    git: [
        {
            id:'5.1',
            section: 'Submodules',
            title: 'Git Submodules',
            level: 'Intermidiate',
            importance: 'Must Read',
            links: ['http://git-scm.com/book/en/Git-Tools-Submodules'],
            description: 'A good starting point for git submodules',
            notes: "If it looks too verbose, try skimming it first"
        },
        {
            id:'5.2.1',
            section: 'Submodules',
            title: 'Git Submodules Tutorial',
            level: 'Intermidiate +',
            importance: 'Useful',
            links: ['https://git.wiki.kernel.org/index.php/GitSubmoduleTutorial'],
            description: 'The kernel.org tutorial, really straightforward, but requires a fair knowledge of git internals',
            notes: ""
        },
        {
            id:'5.2.2',
            section: 'Submodules',
            title: 'Understanding Git Submodules',
            level: 'Intermidiate +',
            importance: 'Useful',
            links: ['http://speirs.org/blog/2009/5/11/understanding-git-submodules.html'],
            description: 'A detailed overview of git submodules, with a good insight to the internals of submodules',
            notes: ""
        },
        {
            id:'5.3',
            section: 'Submodules',
            title: 'Git Submodules: Core Concept, Workflows And Tips ',
            level: 'Intermidiate +',
            importance: 'Very Useful',
            links: ['http://blogs.atlassian.com/2013/03/git-submodules-workflows-tips/'],
            description: 'A good overview of common git submodule workflows, can be used as a good cheat-sheet',
            notes: "Despite the author's opinion, I really like git submodules."
        }
    ],
    linux: [
        {
            id: '2',
            section: 'Commands',
            title: 'Linuxgems Cheat Sheet',
            level: 'Elementary',
            importance: 'Useful',
            links: ['https://github.com/WilliamHackmore/linuxgems/blob/master/cheat_sheet.org.sh'],
            description: 'A long cheat sheet of common elementary linux commands',
            notes: ""
        }
    ],
    ruby: [
        {
            id: '1.1',
            section: 'Syntax',
            title: 'Rubby Warrior',
            level: 'Elementary +',
            importance: 'Interesting',
            links: ['https://www.bloc.io/ruby-warrior/'],
            description: 'Learn ruby programming while playing a turned-based game!',
            notes: ""
        }
    ],
    java: [
    ],
    android: [
        {
            id: '6.3',
            section: 'Test',
            title: 'Generating a coverage report for your unit tests',
            level: 'Intermidiate +',
            importance: 'Useful',
            links: ['http://blog.rabidgremlin.com/2010/11/19/android-tips-generating-a-coverage-report-for-your-unit-tests/'],
            description: "Why should I test if I can't get coverage report! (Just kidding!)",
            notes: ""
        }
    ]
};

var layoutData = {
    js: {
        name: 'JavaScript'
    },
    frontend: {
        name: 'Frontend Development'
    },
    cs: {
        name: 'Computer Science'
    },
    tools: {
        name: 'Tools'
    },
    web: {
        name: 'Web Programming'
    },
    python: {
        name: 'Python'
    },
    django: {
        name: 'Django'
    },
    git: {
        name: 'Git'
    },
    linux: {
        name: 'Linux'
    },
    ruby: {
        name: 'Ruby Language'
    },
    java: {
        name: 'Java Language'
    },
    android: {
        name: 'Android Development'
    }
};

_.templateSettings = {interpolate : /\{\{(.+?)\}\}/g};
var sectionT = _.template('<h2>{{title}}</h2><table class="table table-hover"><tr><th>ID</th><th>Section</th><th>Name</th><th>Level</th><th>Importance</th><th></th></tr><tbody id="{{id}}-resources"></tbody></table><br/>');
var createRow = _.template('<tr><td>{{id}}</td><td>{{section}}</td><td title="{{description}}">{{title}}</td><td>{{level}}</td><td>{{importance}}</td><td>{{linkHtml}}</td></tr>');
var createLink = _.template('<a href="{{href}}" target="_blank">{{title}}</a>');
$(function(){
    var i, j, rs, r, lang;
    for (lang in resources) {
        if (!resources.hasOwnProperty(lang)) continue;
        rs = resources[lang];
        if (resources[lang].length > 0) {
            $('#resources-container').append(sectionT({title: layoutData[lang].name, id: lang}));
        }
        for (i=0; i<rs.length; i++) {
            r = rs[i];
            r.linkHtml = '';
            for (j=0; j< r.links.length; j++) {
                r.linkHtml += createLink({href: r.links[j], title: '<span class="glyphicon glyphicon-link"></span>'});
            }
            $('#' + lang + '-resources').append(createRow(r));
        }
    }
});
