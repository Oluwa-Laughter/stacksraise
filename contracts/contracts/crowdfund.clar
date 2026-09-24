;; StacksRaise: Block-Height Crowdfunding Contract
;; Clarity 6

;; Constants & Error Codes
(define-constant ERR_NOT_CREATOR (err u100))
(define-constant ERR_CAMPAIGN_EXPIRED (err u101))
(define-constant ERR_CAMPAIGN_STILL_ACTIVE (err u102))
(define-constant ERR_GOAL_NOT_REACHED (err u103))
(define-constant ERR_GOAL_ALREADY_REACHED (err u104))
(define-constant ERR_NO_CONTRIBUTION_FOUND (err u105))
(define-constant ERR_INVALID_AMOUNT (err u106))
(define-constant ERR_ALREADY_CLAIMED (err u107))
(define-constant ERR_CAMPAIGN_NOT_FOUND (err u404))

;; State Variables
(define-data-var next-campaign-id uint u1)

;; Data Maps
(define-map Campaigns
    uint 
    {
        creator: principal,
        target-stx: uint,        ;; Stored in micro-STX (1 STX = 1,000,000 uSTX)
        raised-stx: uint,        ;; Stored in micro-STX
        end-block: uint,
        claimed: bool
    }
)

(define-map Contributions
    { campaign-id: uint, contributor: principal }
    uint
)

;; ---------------------------------------------------------
;; Public Functions
;; ---------------------------------------------------------

;; 1. Create a Campaign
(define-public (create-campaign (target-stx uint) (duration-blocks uint))
    (let
        (
            (campaign-id (var-get next-campaign-id))
            (end-block (+ block-height duration-blocks))
        )
        (asserts! (> target-stx u0) ERR_INVALID_AMOUNT)
        (asserts! (> duration-blocks u0) ERR_INVALID_AMOUNT)
        
        (map-insert Campaigns campaign-id {
            creator: tx-sender,
            target-stx: target-stx,
            raised-stx: u0,
            end-block: end-block,
            claimed: false
        })
        
        (var-set next-campaign-id (+ campaign-id u1))
        (ok campaign-id)
    )
)

;; 2. Fund a Campaign
(define-public (fund-campaign (campaign-id uint) (amount-stx uint))
    (let
        (
            (campaign (unwrap! (map-get? Campaigns campaign-id) ERR_CAMPAIGN_NOT_FOUND))
            (prior-contribution (default-to u0 (map-get? Contributions { campaign-id: campaign-id, contributor: tx-sender })))
            (contract-address (as-contract tx-sender))
        )
        (asserts! (> amount-stx u0) ERR_INVALID_AMOUNT)
        (asserts! (< block-height (get end-block campaign)) ERR_CAMPAIGN_EXPIRED)
        
        ;; Transfer STX from contributor to contract principal
        (try! (stx-transfer? amount-stx tx-sender contract-address))
        
        ;; Update state
        (map-set Campaigns campaign-id (merge campaign {
            raised-stx: (+ (get raised-stx campaign) amount-stx)
        }))
        (map-set Contributions 
            { campaign-id: campaign-id, contributor: tx-sender }
            (+ prior-contribution amount-stx)
        )
        (ok true)
    )
)

;; 3. Claim Funds (Creator only, after deadline if target met)
(define-public (claim-funds (campaign-id uint))
    (let
        (
            (campaign (unwrap! (map-get? Campaigns campaign-id) ERR_CAMPAIGN_NOT_FOUND))
            (raised (get raised-stx campaign))
        )
        (asserts! (is-eq tx-sender (get creator campaign)) ERR_NOT_CREATOR)
        (asserts! (>= block-height (get end-block campaign)) ERR_CAMPAIGN_STILL_ACTIVE)
        (asserts! (>= raised (get target-stx campaign)) ERR_GOAL_NOT_REACHED)
        (asserts! (not (get claimed campaign)) ERR_ALREADY_CLAIMED)
        
        (map-set Campaigns campaign-id (merge campaign { claimed: true }))
        (as-contract (stx-transfer? raised tx-sender (get creator campaign)))
    )
)

;; 4. Claim Refund (Contributor only, after deadline if target missed)
(define-public (claim-refund (campaign-id uint))
    (let
        (
            (campaign (unwrap! (map-get? Campaigns campaign-id) ERR_CAMPAIGN_NOT_FOUND))
            (contributor tx-sender)
            (refund-amount (unwrap! (map-get? Contributions { campaign-id: campaign-id, contributor: tx-sender }) ERR_NO_CONTRIBUTION_FOUND))
        )
        (asserts! (>= block-height (get end-block campaign)) ERR_CAMPAIGN_STILL_ACTIVE)
        (asserts! (< (get raised-stx campaign) (get target-stx campaign)) ERR_GOAL_ALREADY_REACHED)
        (asserts! (> refund-amount u0) ERR_NO_CONTRIBUTION_FOUND)
        
        ;; Reset contribution to zero before transfer
        (map-set Contributions { campaign-id: campaign-id, contributor: contributor } u0)
        (as-contract (stx-transfer? refund-amount tx-sender contributor))
    )
)

;; ---------------------------------------------------------
;; Read-Only Getters
;; ---------------------------------------------------------

(define-read-only (get-campaign (campaign-id uint))
    (map-get? Campaigns campaign-id)
)

(define-read-only (get-campaign-count)
    (ok (- (var-get next-campaign-id) u1))
)

(define-read-only (get-contribution (campaign-id uint) (contributor principal))
    (ok (default-to u0 (map-get? Contributions { campaign-id: campaign-id, contributor: contributor })))
)

(define-read-only (get-current-block-height)
    (ok block-height)
)
