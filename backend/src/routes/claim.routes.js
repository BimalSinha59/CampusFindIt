import { Router } from "express";
import { 
    createClaim, 
    getMyItemsClaims,
    getMySubmittedClaims,
    updateClaimStatus,
    deleteClaim
} from "../controllers/claim.controller.js";

const router = Router();

// Create a new claim
router.route("/").post(createClaim);

// Get claims received for items posted BY the user (Reporter Dashboard)
router.route("/my-items/:userId").get(getMyItemsClaims);

// Get claims submitted BY the user (Claimant's "My Claims" page)
router.route("/user/:userId").get(getMySubmittedClaims);

// Delete a claim (Reporter rejecting or Claimant withdrawing)
router.route("/:claimId").delete(deleteClaim);

router.route('/:id').put(updateClaimStatus);

export default router;