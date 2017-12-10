#!/bin/sh

extension_name="antiquer"

mode=$1
mode_develop="develop"
mode_release="release"
mode_clean="clean"

platform=$2
platform_chrome="chrome"
platform_firefox="firefox"

sourcedir="source"
imagedir="resources"

developdir="develop"
releasedir="release"

images="${imagedir}/icon_16x.png ${imagedir}/icon_16x_bw.png ${imagedir}/icon_48x.png ${imagedir}/icon_48x_bw.png ${imagedir}/icon_128x.png ${imagedir}/icon_128x_bw.png ${imagedir}/popup_icon.png"

# Prepares files with shared javascript code.
# Arguments:
#   1. The directory in which to compile files
compile()
{
    echo "Compiling..."
    
    targetdir=$1    
    replacement="${targetdir}/replacement.js"
    popup="${targetdir}/popup.js"
    common="common/common_${platform}.js"
  
   #cat "${common} ${replacement} > ${replacement}2"
    #cat "${common} ${popup} > ${popup}2"
    
    prepend "${common}" "${replacement}"
    prepend "${common}" "${popup}"
    
    echo "Compiled successfully"
}

prepend()
{
    cat $1 $2 > "temp"
    rm $2
    cp "temp" $2
    rm "temp"
}

# Validate arguments
if test "${platform}" != "${platform_chrome}" && test "${platform}" != "${platform_firefox}"
then

    echo "Error: invalid platform"
    exit
fi

# Process
if test "$mode" == "$mode_develop"
then

    echo "Cleaning..."
    
    rm -rf $developdir
    
    echo "Bundling for develop"
    
    mkdir $developdir
    mkdir "${developdir}/${imagedir}"
    cp $sourcedir/* $developdir
    cp $images "${developdir}/${imagedir}"
    
    compile "${developdir}"

    echo "Bundled successfully"

elif test "$mode" == "$mode_release"
then

    echo "Cleaning..."

    rm -rf $releasedir
    rm $extension_name.zip
    
    echo "Bundling for release"

    mkdir $releasedir
    cp $sourcedir/* $releasedir
    compile "${releasedir}"
    
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
