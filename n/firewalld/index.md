---
layout: note
title: FirewallD
---

## Terminology

* **Zone:** a group of rules, network interfaces are assigned to zones. Default zones include block, public, trusted.

## Tasks

* system control: `systemctl restart firewalld.service`
* status: `firewall-cmd --state`
* show active zones and their interfaces: `firewall-cmd --get-active-zones`
* show zone rules: `firewall-cmd --list-all [--zone=x]`
* reload firewalld: `firewall-cmd --reload`
* show available services: `firewall-cmd --get-services`
* allow a service (needs reload): `firewall-cmd --zone=public --permanent --add-service=http`
* default services are defined in `/usr/lib/firewalld/services`, and new ones can be defined in `/etc/firewalld/services/` (needs reload).

## Examples

### Simple Server Config

    systemctl start firewalld.service     # ssh is allowed by default in public zone
    firewall-cmd --list-all
    firewall-cmd --zone=public --permanent --add-service=http
    firewall-cmd --zone=public --permanent --add-service=https
    firewall-cmd --reload


### SNMP Service

    # /etc/firewalld/services/snmp.xml
    <?xml version="1.0" encoding="utf-8"?>
    <service>
        <short>SNMP</short>
        <description>SNMP protocol</description>
        <port protocol="udp" port="161"/>
    </service>


## References

* [How To Set Up a Firewall Using FirewallD on CentOS 7](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-firewall-using-firewalld-on-centos-7)
