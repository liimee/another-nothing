export interface Appp {
  app: string,
  id: number,
  fs: boolean,
  top: boolean,
  title: string,
  fsable: boolean,
  min: boolean
}

export interface Win {
  app: Appp,
  full: Function,
  drag: Function,
  close: Function,
  msg: Function,
  min: Function
}

export interface Apps {
  name: string
}
