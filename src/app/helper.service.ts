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
  public createIdMap(credHistory : string[], driveIdHistory : string[]) : Object[]{
    let idMap : Object[] = [];
    let path = credHistory[0];
    let id = null;
    let i : number = 0;
    let arrLength = credHistory.length;
    do{
      idMap.push({"id" : id, "path" : path});
      i++;
      if(i === 1)
        path += credHistory[i];
      else
        path += "/" + credHistory[i];
      id = driveIdHistory[i-1];
      id = (id === undefined)? null : id;
    }while(i < arrLength-1);
    return idMap;
  }

}
