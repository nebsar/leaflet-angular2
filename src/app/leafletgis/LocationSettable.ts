export interface LocationSettable {
  setLocation():void;
}

export class Elem {

  var1: number;

  var2: string;

  constructor() {
    this.var1 = 1;
    this.var2 ="deneme";
  }

  setLocation(): void {
    console.log(this.var2);
  }

  getLocation(): any{
    return null;
  }

}
