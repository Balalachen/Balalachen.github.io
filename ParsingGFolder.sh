#!/bin/bash
declare -a IDArray
declare -a NameArray

curl -L -o ./gfolder "https://drive.google.com/drive/folders/$1?usp=sharing"

cat ./gfolder | grep -Eo 'data-id="[^/"]+' | sed 's/data-id="//' > ./tempIDs
cat ./gfolder | grep -Eo 'aria-label="[^/"]+Image"' | sed 's/aria-label="//; s/ Image"//' > ./tempNames

mapfile -t IDArray < ./tempIDs
mapfile -t NameArray < ./tempNames

for (( i=0; i<${#IDArray[@]}; i=i+1 ))
do
    # echo "Save: ./$2/${NameArray[i]}"
    curl -L -o "./$2/${NameArray[i]}" "https://drive.google.com/uc?export=download&id=${IDArray[i]}"
done

rm ./gfolder
rm ./tempIDs
rm ./tempNames
unset IDArray
unset NameArray