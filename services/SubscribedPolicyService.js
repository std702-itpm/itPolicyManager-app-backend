const SubscribedPolicyService = function () {
    const policyStatuses = [
        { id: 1, status: "not reviewed" },
        { id: 2, status: "confirmation" },
        { id: 3, status: "adoption" },
        { id: 4, status: "awareness" }
    ];

    this.getNextStatus = function (currentStatus) {
        if (currentStatus === "awareness") {
            return "awareness";
        }
        console.log(currentStatus);
        
        let currentPolicy = policyStatuses.find(policyStatus => policyStatus.status === currentStatus);
        console.log(currentPolicy);
        
        return policyStatuses.find(policyStatus => policyStatus.id === currentPolicy.id + 1).status;
    }

    this.getNotReviewStatus = function () {
        return policyStatuses.find(policyStatus=> policyStatus.id === 1).status;
    }

    this.getComfirmationStatus = function () {
        return policyStatuses.find(policyStatus=> policyStatus.id === 2).status;
    }

    this.getAdoptionStatus = function () {
        return policyStatuses.find(policyStatus=> policyStatus.id === 3).status;
    }

    this.getAwarenessStatus = function () {
        return policyStatuses.find(policyStatus=> policyStatus.id === 4).status;
    }
}

module.exports = SubscribedPolicyService;