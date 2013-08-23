---
layout: page
title:  "Android Feature Location Project"
translations: "fa"
---

### Feature Location

Feature Location is a technique for finding a specific part of code (e.g. the code for the spell checker in a
word processor), called a feature, in a large codebase using automated algorithms and tools. If implemented
and used effectively, feature location can facilitate software development a lot, specially when programmers
are asked to maintain or make changes to a code they did not wrote themselves.


### My Project

In this project, which is conducted under supervision of [Dr. Heydarnoori][0] for my BSc thesis in the Sharif
University of Technology, I am trying to design and implement specific feature location techniques and
algorithms for Android projects. The work on the project is currently in progress, but I am looking forward
to publishing further results on the project soon.


### Sub-Projects

The static feature location techniques require detailed information about the code structure of the whole
project, which must be gathered using a static parser of the project's programming language. In the case of
Android projects, because of using multiple programming languages (Java, XML, and even possibly C), having
multiple parsers as well as using a uniform model for storing parse results will make more detailed static
analysis of the project possible. As a result, first I have written [static-inspector][1] as a sub-project
to use it in static feature location of Android project. To test its functionality and fitness for the main
project, I did some experiments with it and produced some early results. You can see these results in the
rest of the page.


#### Code Visualization

Having a project-level parser made it very easy to generate some insightful reports about large projects.
Having better vision of the overall project code structure is very near to the purpose of feature location,
so I tried creating an automatic line-of-code (LOC) analyzer using my project parser. Below, you can see
results  of LOC analyses I have made using it for a few sample project. Thanks to superb [d3.js][2] library,
the reports are fully interactive - try clicking on segments! The initial code for the reports are by
[Andereas Dewes][4].

Sample open-source Android projects' analysis results:

 * [GitHub-Android](/projects/loc-analysis/android/github-android.html) (62 KLOC)
 * [Google MyTracks](/projects/loc-analysis/android/my-tracks.html) (50 KLOC)
 * [Linphone-Android](/projects/loc-analysis/android/linphone-android.html) (42 KLOC)
 * [VLC-Android](/projects/loc-analysis/android/vlc-android.html) (34 KLOC)

For the sake of completeness, I must mention that the reports show line-of-code distribution among project's
sub-folders, and will give some very useful insight into the overall project structure and code organization.
For better results, some justifications have been done on reporting LOC for specific files (like downloaded
minified libraries, data dumps, etc.) to make results more usable, however, there are still some inevitable
noises. Anyway, I hope you enjoy viewing and analysing the results as much as I enjoyed creating them!


[0]: http://sharif.edu/~heydarnoori/
[1]: https://github.com/amiraliakbari/static-inspector
[2]: https://github.com/mbostock/d3
[3]: http://arsh.co
[4]: http://www.andreas-dewes.de/code_is_beautiful/
