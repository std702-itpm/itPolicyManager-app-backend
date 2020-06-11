const SubscribedPolicyService = function () {
    const policyStatuses = [
        { id: 1, status: "not reviewed" },
        { id: 2, status: "confirmation" },
        { id: 3, status: "adoption" },
        { id: 4, status: "awareness" },
        { id: 5, status: "reviewed" }
    ];

    this.getNextStatus = function (currentStatus) {
        if (currentStatus === "reviewed") {
            return "reviewed";
        }
        return policyStatuses.find(policyStatus => policyStatus.id ===
            policyStatuses.find(policyStatus => policyStatus.status === currentStatus).id + 1).status;
    }

    this.getNotReviewStatus = function () {
        return policyStatuses[0].status;
    }

    this.getComfirmationStatus = function () {
        return policyStatuses[1].status;
    }

    this.getAdoptionStatus = function () {
        return policyStatuses[2].status;
    }

    this.getAwarenessStatus = function () {
        return policyStatuses[3].status;
    }

    this.getReviewedStatus = function () {
        return policyStatuses[4].status;
    }
}

module.exports = SubscribedPolicyService;