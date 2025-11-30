// this file is used to use req.user in express with typescript
import { IUser } from "./src/models/User.model.ts"; 

declare global {
  namespace Express {
    interface Request {
      user?: IUser; 
    }
  }
}