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

images="${imagedir}/icon_16x.png ${imagedir}/icon_16x_bw.png ${imagedir}/icon_48x.png ${imagedir}/icon_48x_bw.png ${imagedir}/icon_128x.png ${imagedir}/icon_128x_bw.png ${imagedir}/popup_icon.png"

if test "$mode" == "$mode_develop"
then

    echo "Cleaning..."
    
    rm -rf $developdir
    
    echo "Bundling for develop"
    
    mkdir $developdir
    mkdir "${developdir}/${imagedir}"
    cp $sourcedir/* $developdir
    cp $images "${developdir}/${imagedir}"

    echo "Bundled successfully"

elif test "$mode" == "$mode_release"
then

    echo "Cleaning..."

    rm -rf $releasedir
    rm $extension_name.zip
    
    echo "Bundling for release"

    mkdir $releasedir
    cp $sourcedir/* $releasedir
    zip -rj $extension_name.zip $releasedir
    zip $extension_name.zip $images
    rm -rf $releasedir

    echo "Bundled successfully"
    
elif test "$mode" == "$mode_clean"
then

    echo "Cleaning..."

    rm -rf $developdir
    rm -rf $releasedir
    rm $extension_name.zip

fi
