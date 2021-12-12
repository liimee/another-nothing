export interface Appp {
  app: String,
  id: Number,
  fs: Boolean,
  top: Boolean,
  title: String
}

export interface Win {
  app: Appp,
  full: Function,
  drag: Function,
  close: Function
}

export interface Apps {
  name: String
}
