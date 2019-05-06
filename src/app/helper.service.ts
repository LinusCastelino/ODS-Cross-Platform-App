import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor() { }

  /*
      This method creates the idMap from the cred and driveID history arrays 
      that must be sent in submit, mkdir and delete requests
  */
  public createIdMap(credHistory : string[], driveIdHistory : string[], operation : string) : Object[]{

    console.log("Creating ID map");
    console.log(credHistory);
    console.log(driveIdHistory);

    let idMap : Object[] = [];
    let path = credHistory[0];
    let id = null;
    let i : number = 0;
    let arrLength : number= credHistory.length;

    // for submit we need to point to the directory of the selection and not the selection
    // hence, iterating only until length-1 (ignoring last element in array) 
    if(operation === "submit")
      arrLength--;

    do{
      idMap.push({"id" : id, "path" : path});
      console.log(idMap);
      i++;
      if(i === 1)
        path += credHistory[i];
      else
        path += "/" + credHistory[i];
      id = driveIdHistory[i-1];
      id = (id === undefined)? null : id;
    }while(i < arrLength);
    return idMap;
  }

}
