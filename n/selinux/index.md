---
layout: note
title: SELinux
---

## Terminology

* **Context:** security-related label added to each file and process. Has: user, role, type, level.

## Tasks

* See status: `sestatus`
* See file labels: `ls -Z`
* Change file context, web server root example: `chcon -R -t httpd_sys_content_t /var/www`
* `setsebool -P httpd_read_user_content 1`
* `setsebool -P httpd_can_network_connect 1`


## Examples


## References

* [SELinux Contexts – Labeling Files](https://access.redhat.com/documentation/en-US/Red_Hat_Enterprise_Linux/6/html/Security-Enhanced_Linux/sect-Security-Enhanced_Linux-Working_with_SELinux-SELinux_Contexts_Labeling_Files.html)
* http://stackoverflow.com/questions/6795350/nginx-403-forbidden-for-all-files
* https://www.digitalocean.com/community/tutorials/an-introduction-to-selinux-on-centos-7-part-1-basic-concepts
* https://major.io/2012/01/25/getting-started-with-selinux/
* http://unix.stackexchange.com/questions/9163/does-selinux-provide-enough-extra-security-to-be-worth-the-hassle-of-learning-set
* http://serverfault.com/questions/237801/does-selinux-make-redhat-more-secure
* https://www.centos.org/docs/5/html/5.1/Deployment_Guide/sec-selinux-status-viewing.html
* https://www.centos.org/docs/5/html/5.2/Deployment_Guide/sec-sel-enable-disable.html
* https://blog.lysender.com/2015/07/centos-7-selinux-php-apache-cannot-writeaccess-file-no-matter-what/
* https://en.wikipedia.org/wiki/Linux_Security_Modules
* http://askubuntu.com/questions/23422/is-it-a-bad-idea-to-run-selinux-and-apparmor-at-the-same-time
* http://danwalsh.livejournal.com/22347.html
* http://nts.strzibny.name/allowing-nginx-to-use-a-pumaunicorn-unix-socket-with-selinux/
* https://wiki.gentoo.org/wiki/SELinux/Tutorials/What_is_this_unconfined_thingie_and_tell_me_about_attributes
