#!/bin/bash
declare -a IDArray
declare -a NameArray

curl -L -o ./gfolder "https://drive.google.com/drive/folders/$1?usp=sharing&key=${4}"

cat ./gfolder | grep -Eo 'data-id="[^/"]+' | sed 's/data-id="//' > ./tempIDs
cat ./gfolder | grep -Eo "aria-label=\"[^/\"]+$3\"" | sed "s/aria-label=\"//; s/ $3\"//" > ./tempNames

mapfile -t IDArray < ./tempIDs
mapfile -t NameArray < ./tempNames

for (( i=0; i<${#IDArray[@]}; i=i+1 ))
do
    if [ "${NameArray[i]}" != "" ]
    then
        cf=$(echo $RANDOM | md5sum | head -c 4)
        # html=`curl -c ./cookie -s -L "https://drive.google.com/uc?export=download&id=${IDArray[i]}"`
        # echo ${html}
        # cf=$(echo ${html} | grep -Po '(confirm=[a-zA-Z0-9\-_]+)')

        # echo "Save: ./$2/${NameArray[i]} ID=${IDArray[i]} ${cf}"
        curl -L -o "./$2/${NameArray[i]}" "https://drive.google.com/uc?export=download&${cf}&id=${IDArray[i]}&key=${4}"
        echo "-------------------------------------------"
    fi
done

rm ./gfolder
rm ./tempIDs
rm ./tempNames
unset IDArray
unset NameArray
