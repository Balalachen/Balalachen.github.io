#!/bin/bash
# Autho Ref. from https://www.quora.com/How-do-I-download-a-very-large-file-from-Google-Drive/answer/Shane-F-Carr
declare -a IDArray
declare -a NameArray

# curl -L -o ./gfolder "https://drive.google.com/drive/folders/$1?usp=sharing"
curl -H "Authorization: Bearer $4" "https://drive.google.com/drive/folders/$1?usp=sharing" -o ./gfolder

cat ./gfolder | grep -Eo 'data-id="[^/"]+' | sed 's/data-id="//' > ./tempIDs
cat ./gfolder | grep -Eo "aria-label=\"[^/\"]+$3\"" | sed "s/aria-label=\"//; s/ $3\"//" > ./tempNames

mapfile -t IDArray < ./tempIDs
mapfile -t NameArray < ./tempNames

sleep 1

for (( i=0; i<${#IDArray[@]}; i=i+1 ))
do
    if [ "${NameArray[i]}" != "" ]
    then
        echo "Save: ./$2/${NameArray[i]} ID=${IDArray[i]}"
        curl -H "Authorization: Bearer $4" "https://www.googleapis.com/drive/v3/files/${IDArray[i]}?alt=media" -o "./$2/${NameArray[i]}"
        echo "-------------------------------------------"
    fi
done

rm ./gfolder
rm ./tempIDs
rm ./tempNames
unset IDArray
unset NameArray
