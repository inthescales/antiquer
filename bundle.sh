#!/bin/sh

extension_name="diaeresizer"
mode=$1
mode_develop="develop"
mode_release="release"
mode_clean="clean"

sourcedir="source"
imagedir="resources"

developdir="develop"
releasedir="release"

images="${imagedir}/16x.png ${imagedir}/16x_bw.png ${imagedir}/48x.png ${imagedir}/48x_bw.png ${imagedir}/128x.png ${imagedir}/128x_bw.png ${imagedir}/popup_icon.png"

if test "$mode" == "$mode_develop"
then

    echo "Cleaning..."
    
    rm -rf $developdir
    
    echo "Bundling for develop"
    
    mkdir $developdir
    cp $sourcedir/* $developdir
    cp $images $developdir

    echo "Bundled successfully"

elif test "$mode" == "$mode_release"
then

    echo "Cleaning..."

    rm -rf $releasedir
    rm $extension_name.zip
    
    echo "Bundling for release"

    mkdir $releasedir
    cp $sourcedir/* $releasedir
    cp $images $releasedir
    zip -rj $extension_name.zip $releasedir/*
    rm -rf $releasedir

    echo "Bundled successfully"
    
elif test "$mode" == "$mode_clean"
then

    echo "Cleaning..."

    rm -rf $developdir
    rm -rf $releasedir
    rm $extension_name.zip

fi
