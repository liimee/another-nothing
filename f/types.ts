export interface Appp {
  app: string,
  id: number,
  fs: boolean,
  top: boolean,
  title: string
}

export interface Win {
  app: Appp,
  full: Function,
  drag: Function,
  close: Function,
  msg: Function
}

export interface Apps {
  name: string
}
