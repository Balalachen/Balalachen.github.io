#!/bin/bash
declare -a IDArray
declare -a NameArray

curl -L -o ./gfolder "https://drive.google.com/drive/folders/$1?usp=sharing"

cat ./gfolder | grep -Eo 'data-id="[^/"]+' | sed 's/data-id="//' > ./tempIDs
cat ./gfolder | grep -Eo "aria-label=\"[^/\"]+$3\"" | sed "s/aria-label=\"//; s/ $3\"//" > ./tempNames

mapfile -t IDArray < ./tempIDs
mapfile -t NameArray < ./tempNames

for (( i=0; i<${#IDArray[@]}; i=i+1 ))
do
    if [ "${NameArray[i]}" != "" ]
    then
        # echo "Save: ./$2/${NameArray[i]}"
        curl -L -o "./$2/${NameArray[i]}" "https://drive.google.com/uc?export=download&id=${IDArray[i]}"
    fi
done

rm ./gfolder
rm ./tempIDs
rm ./tempNames
unset IDArray
unset NameArray
