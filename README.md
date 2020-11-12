<a href="https://github.com/z89/nextjs-tor-v3"><div  align="center"><img src="https://i.imgur.com/ljISzYV.png" alt="Logo"></div></a>
<div align="center">
<img src="https://img.shields.io/badge/node.js-v14.13.1-blue?style=for-the-badge&logo=npm"></img>
<img src="https://img.shields.io/badge/next.js-v6.14.8-blue?style=for-the-badge"></img>
<img src="https://img.shields.io/badge/TOR-v0.4.4.5-green?style=for-the-badge&logo=tor"></img>
<br>
<img src="https://img.shields.io/badge/linux server-supported-blue?style=for-the-badge"></img>
<img src="https://img.shields.io/badge/windows server-not%20supported-red?style=for-the-badge"></img>
</div>
<br>
<p align="center">A guide to setup a <strong>node.js</strong> server using <strong>next.js</strong> to handle static webpage routing as a <strong>TOR v3</strong> hidden service!</p>

<br>
<strong><p  align="center">z89 (Author): This is not a comprehensive nor official guide to setup up this combo, it is soley a reference for my own server builds. Use this information with a grain of salt and please read the official docs for actually guidance on proper secure installations.</p></strong>

<br>

<!-- TABLE OF CONTENTS -->
## Table of Contents

* [About the Guide](#about-the-guide)
* [Where to find LXC templates?](#lxc-templates)
* [Installing the Node.js backend](#backend-installation)
  * [1. Initialising pacman keys](#initialising-pacman-keys)
  * [2. Downloading pacman mirrors](#downloading-pacman-mirrors)
  * [3. Download required project packages](#download-project-packages)
  * [4. Create non-root arch user w/ root privs](#create-arch-user)
  * [5. Download NVM installer script](#download-nvm-installer)
  * [6. Install node.js server for backend](#install-node-server)
* [Installing the Next.js front-end](#frontend-installation)
  * [1. Git clone front-end site](#git-clone-website)
  * [2. Install required dependencies for build](#install-frontend-dependencies)
  * [3. Create production build](#create-production-build)
  * [4. Setup pm2 daemon manager](#setup-pm2-service)
* [Installing TOR v3 Hidden Service](#tor-installation)
  * [1. Create hidden service directory w/ permissions](#create-hidden-service-directory)
  * [2. Edit torrc config file](#edit-torrc-config)
  * [3. Start tor service using systemctl](#start-tor-service)
* [Generate Onion v3 custom vanity address](#custom-generated-v3-address)



<!-- ABOUT THE PROJECT -->
## About The Guide

*Last Updated 11/10/2020*:

This is a custom guide showing you how to install a node.js backend with next.js handling the front end of statically served webpages. This is important to note as this setup does not deal with SSR (Server-side rendering), therefore the whole website can be generated before runtime during the production build. This improves performance and security as no requests need to be routed to the backend server. Note that this guide is designed not to be fool-proof but simplistic, therefore assume the security of this web server to be of the lowest form (none). With this, we are also switching to the onion v3 hidden services, which implements a secure key exchange to allow only certain authorised users to access the tor site. Although this is not in the scope of this guide, it is a very critical feature that is worth mentioning for those who were unaware, as it should be implemented for a lot of version 3 sites to prevent unwarranted crawling and unauthorised access on TOR.


<!-- GETTING STARTED -->
## Backend Installation

To start, we must have a webserver. I am currently using an LXC container on promox to run a base arch template for my server. Most instructions in this guide will be therefore arch linux based, you will have to adapt certain commands to your distro of choice.



#### LXC Templates

> Irrelevant Promox Info: Promox comes default with a wide variety of LXC container templates from a range of different distros. Finding this list has frustrated me the most about promox, so to save your tears , select a storage medium such as the default "local" storage, and then within that window select the content tab. You should then see the "templates" button towards to the top, click this and you can proceed to search and download templates directly within promox without having to go to an external LXC containers site and importing.


#### Initialising pacman keys
To download packages on the LXC arch template, we have to setup pacman.

1. Initialise pacman with the required keys. 
```sh
pacman-key --init
```
2. Populate pacman with the initialised keys
```sh
pacman-key --populate
```

#### Downloading pacman mirrors
3. You now need the mirrors for pacman, you have the choice of manually installing them or for ease of use, change the country code below to your desired location and run the command.

```sh
curl https://www.archlinux.org/mirrorlist/?country=AU | cut -c 2- > /etc/pacman.d/mirrorlist
```

#### Download project packages
4. Once the mirrors are installed, update pacman & install the required packages for this whole project. 

```sh
pacman -Syyu && pacman -S sudo vim base-devel git pm2 tor
```

#### Create arch user
5. After the packages are installed, it is ideal not to run or install anything as the root user. Therefore, creating a non-root user with default permissions will suffice. It is also a good idea to change your root password if it is not secure enough.

```sh
useradd -m archie
passwd archie
passwd (change root passwd)
```
6. To give root privileges to the new user, add them to the sudoers file
```sh
vim /etc/sudoers
```
Type the following underneath the root user:

>_{username} ALL=(ALL) ALL_

**Note that this directly "hardcodes" the user in the sudoers file rather than the "proper way" to deal with permissions, which is to add users to the wheel group.**

Then logout of the root user and log back in as the newly created user


#### Download NVM installer
7. Install nvm via curl & reboot the machine after installation to update bash with the **nvm** command

```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.36.0/install.sh | bash
reboot
```
#### Install node server
8. After reboot, install the latest version of node

```sh
nvm install node
```


## Front End Installation

Now that we have successfully installed the backend node server, it's time to install our site with the next.js framework

#### Git clone website
1. Download the current version of our next.js site

```sh
git clone https://github.com/z89/nextjs-tor-v3
```

#### Install frontend dependencies
2. Navigate & install the app's dependencies in the **root directory** of the **app** _(eg. /app/)_

```sh
cd /app/
npm install
```

#### Create production build
3. Create the production build of our next.js site then test if our server is live & functioning

```sh
npm run build
npm start
```

#### Setup pm2 service
4. Use the pm2 service to manage the deployment of our website to handle it on port 3000 (default port)

```sh
pm2 start npm --name "{your server/project name}" -- start
```

5. pm2 has a way to automatically start services upon a reboot, however this seems broken & I haven't successfully got it working. Therefore if the server reboots the following command can be used

```sh
pm2 list
pm2 resurrect
```


## TOR Installation

To setup a TOR hidden service, we first must create a **hidden_service/** directory to contain our secret TOR info. 

#### Create hidden service directory
1. Make the hidden_service directory and set the required permissions for the TOR user

```sh
sudo mkdir /var/lib/tor/hidden_service
sudo chmod 700 /var/lib/tor/hidden_service
sudo chown -R tor:tor /var/lib/tor/hidden_service
```

#### Edit torrc config
2. Next we must change our torrc to include in hidden_service directory along with the port number of our website

```sh
sudo vim /etc/tor/torrc
```
**Uncomment the following lines and change them to the same as below:**

> HiddenServiceDir /var/lib/tor/hidden_service/

> HiddenServiceVersion 3

> HiddenServicePort 80 127.0.0.1:3000

#### Start tor service
3. Now we can start the tor service and check for any errors that might have occurred

```sh
sudo systemctl start tor
sudo systemctl status tor
```

#### Custom Generated V3 Address
To create an onion v3 vanity address with custom prefix, you must calculate hashes until you find a hash that matches your query. This is computationally hard because to calculate a simple 4 length word you must theoretically have to crunch at an address pool of roughly 32^4 addresses (the number 32 comes from the number of characters allowed in a v3 address), which is 1,048,576 addresses. Although that doesn't seem much, it scales by a factor of 32. So a prefix length of 5 characters is 33,554,432 addresses and six is 1,073,741,824. As you can see it scales fast, and the more characters you want, the harder it will be computationally. As of the 11/10/20, I have found that using a tool called mkp224o in combination with a dedicated LXC container is currently the best solution for my environment without spending any money on cloud infrastructure.

1. To start, lets give a brief overview of the specs of the host promox server:
> CPU: 2x 6-core AMD 4332 HE Opteron(tm) Processors == 12 cores total

> RAM: 8x 4gb DDR3 ECC Server RAM sticks == 32GB total

> GPU: none

2. The LXC container (which is dedicated solely for hash generation):
> CPU: 2x 6-core AMD 4332 HE Opteron(tm) Processors = dedicated 8 cores / 12 cores (only using 4 cores for each cpu, can use more)

> RAM: 8x 4gb DDR3 ECC Server RAM sticks == 32GB = dedicated 16GB / 32GB (only using half of total & is still an overkill amount)

> GPU: none

With these LXC container specs I can easily generated a single 6 character length prefix address in less than 10m. Lets see how to set up this generator script on a container.

3. First, download the mkp224o tool from github & install required dependencies
```sh
pacman -Syyu && pacman -S gcc base-devel libsodium make autoconf git
git clone https://github.com/cathugger/mkp224o 
```

4. Next is to compile the mkp224o tool
```sh
./autogen.sh
./configure
make
```

5. Now you are ready to calculate addresses! However I recommend doing a couple of things such as using -d to output the addresses into a folder. It also seems beneficial to use the -B attribute, which is an experimental mode that uses a batching key generation method. It claims to be 10x faster and I noticed a dramatic increase in hashes when using this mode compared to the default settings. This is the command I used to calculate 6 character length prefixes in under 10m:
```sh
mkdir ../onion_addresses
./mkp224o -B -d ../onion_addresses/ {word}
```

6. Once you have your v3 address, it is as simple as replacing your current hidden_service directory with the hostname, public and secrete key files. After a tor server restart the changes should take effect immediately and you can connect through TOR using your fresh new address!
