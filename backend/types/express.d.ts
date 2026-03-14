import { JwtPayload, MemberRole } from "./index";
import { Document } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
      workspace?: Document;
      memberRole?: MemberRole;
      board?: Document;
      card?: Document;
    }
  }
}
