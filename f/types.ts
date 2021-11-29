export interface Appp {
  app: String,
  id: Number,
  fs: Boolean,
  top: Boolean
}

export interface Win {
  app: Appp,
  full: Function,
  drag: Function,
  msg: Function,
  close: Function
}

export interface Apps {
  name: String
}
