#!/bin/bash
# Autho Ref. from https://www.quora.com/How-do-I-download-a-very-large-file-from-Google-Drive/answer/Shane-F-Carr
declare -a IDArray
declare -a NameArray

ACT=$(curl -d client_id=$4 -d client_secret=$5 -d grant_type=refresh_token -d refresh_token=$6 -d redirect_uri=https://developers.google.com/oauthplayground https://accounts.google.com/o/oauth2/token | grep -Eo 'access_token": "[^/"]+' | sed 's/access_token": "//')
# echo "Access Token= ${ACT}"

# curl -L -o ./gfolder "https://drive.google.com/drive/folders/$1?usp=sharing"
curl -H "Authorization: Bearer ${ACT}" "https://drive.google.com/drive/folders/$1?usp=sharing" -o ./gfolder

cat ./gfolder | grep -Eo 'data-id="[^/"]+' | sed 's/data-id="//' > ./tempIDs
cat ./gfolder | grep -Eo "aria-label=\"[^/\"]+$3\"" | sed "s/aria-label=\"//; s/ $3\"//" > ./tempNames

mapfile -t IDArray < ./tempIDs
mapfile -t NameArray < ./tempNames

sleep 1

for (( i=0; i<${#IDArray[@]}; i=i+1 ))
do
    if [ "${NameArray[i]}" != "" ]
    then
        # echo "Save: ./$2/${NameArray[i]} ID=${IDArray[i]}"
        echo "Save: ./$2/${NameArray[i]}"
        curl -H "Authorization: Bearer ${ACT}" "https://www.googleapis.com/drive/v3/files/${IDArray[i]}?alt=media" -o "./$2/${NameArray[i]}"
        # echo "-------------------------------------------"
    fi
done

rm ./gfolder
rm ./tempIDs
rm ./tempNames
unset IDArray
unset NameArray
