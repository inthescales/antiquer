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

images="${imagedir}/icon_16x.png ${imagedir}/icon_16x_bw.png ${imagedir}/icon_48x.png ${imagedir}/icon_48x_bw.png ${imagedir}/icon_128x.png ${imagedir}/icon_128x_bw.png"

# Builds the trie used to find words for replacement
build_trie() {

    echo "Building trie"
    
    targetdir=$1
    
    cd trie
    ruby trie_maker.rb
    mv "trie.json" "../${targetdir}/trie.json"
    cd ..
    
    echo "Built trie"
}

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
if test "${platform}" != "${platform_chrome}" && test "${platform}" != "${platform_firefox}" && test "$mode" != "$mode_clean"
then

    echo "Error: invalid platform"
    exit
fi

# Process
if test "$mode" == "$mode_develop"
then

    echo "Cleaning..."
    rm -rf $developdir
    echo "Clean finished"
    
    echo "Bundling for develop"
    
    mkdir $developdir
    mkdir "${developdir}/${imagedir}"
    cp $sourcedir/* $developdir
    cp $images "${developdir}/${imagedir}"
    
    build_trie "${developdir}"
    compile "${developdir}"

    echo "Bundled successfully"

elif test "$mode" == "$mode_release"
then

    echo "Cleaning..."
    rm -rf $releasedir
    rm $extension_name.zip
    echo "Clean finished"
    
    echo "Bundling for release"

    mkdir $releasedir
    cp $sourcedir/* $releasedir
    build_trie "${releasedir}"
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
    
    echo "Clean finished"

fi
