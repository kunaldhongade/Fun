// module 0x1::betting_pool {
//     use std::error;
//     use std::signer;
//     use std::vector;
//     use std::bcs;
//     use std::option;
//     use aptos_framework::coin;
//     use aptos_framework::aptos_coin::AptosCoin;
//     use aptos_framework::account::{Self, SignerCapability};
//     use aptos_framework::event;
//     use aptos_framework::timestamp;
//     use aptos_std::table::{Self, Table};
//     use aptos_std::hash;
//     use aptos_std::smart_vector;
//     use aptos_framework::object::{Self, Object, ExtendRef, DeleteRef};
//     use std::string::String;

//     // Error codes
//     const ERR_USER_ALREADY_EXISTS: u64 = 1;
//     const ERR_USER_NOT_REGISTERED: u64 = 2;
//     const ERR_INSUFFICIENT_BALANCE: u64 = 3;
//     const ERR_INSUFFICIENT_POOL_BALANCE: u64 = 4;
//     const ERR_AMOUNT_ZERO: u64 = 5;
//     const ERR_NOT_AUTHORIZED: u64 = 6;
//     const ERR_NO_ACCRUED_FEES: u64 = 7;
//     const ERR_AUCTION_ENDED: u64 = 8;
//     const ERR_BID_TOO_LOW: u64 = 9;
//     const ERR_CONTEST_NOT_FOUND: u64 = 10;
//     const ERR_INVALID_QUIZ: u64 = 11;
//     const ERR_QUIZ_NOT_ACTIVE: u64 = 12;
//     const ERR_INVALID_ANSWERS: u64 = 13;
//     const ERR_QUIZ_ALREADY_ATTEMPTED: u64 = 14;

//     struct User has store {
//         owed_value: u64,
//         uuid: vector<u8> 
//     }

//     struct NFT has key {
//         creator: address,
//         name: String,
//         description: String,
//         video_uri: String,
//         extend_ref: ExtendRef,
//     }

//     struct QuizQuestion has store, drop {
//         question: String,
//         correct_answer: String
//     }

//     struct Quiz has key, store {
//         nft: Object<NFT>,
//         creator: address,
//         questions: vector<QuizQuestion>,
//         is_active: bool,
//         required_score: u64
//     }

//     struct Auction has key,store {
//         nft: Object<NFT>,
//         seller: address,
//         start_price: u64,
//         end_time: u64,
//         highest_bidder: option::Option<address>,
//         highest_bid: u64,
//         delete_ref: DeleteRef,
//         extend_ref: ExtendRef,
//     }

//     struct BettingPoolData has key {
//         users: Table<address, User>,
//         pool_amounts: Table<u64, u64>,
//         accrued_fees: u64,
//         commissions_address: address,
//         commission: u64,
//         signer_cap: SignerCapability,
//         nfts: Table<Object<NFT>, address>,
//         auctions: Table<Object<NFT>, Auction>,
//         quizzes: Table<u64, Quiz>,
//         quiz_attempts: Table<address, Table<u64, u64>>,
//         next_quiz_id: u64
//     }

//     #[event]
//     struct QuizCreatedEvent has drop, store {
//         creator: address,
//         quiz_id: u64,
//         nft: Object<NFT>
//     }

//     #[event]
//     struct QuizAttemptedEvent has drop, store {
//         participant: address,
//         quiz_id: u64,
//         score: u64,
//         won_nft: bool
//     }

//     // Events
//     #[event]
//     struct NewUserEvent has drop, store {
//         user_id: vector<u8>,
//         user_address: address
//     }

//     #[event]
//     struct NFTCreatedEvent has drop, store {
//         creator: address,
//         nft: Object<NFT>,
//         video_uri: String
//     }

//     #[event]
//     struct BidPlacedEvent has drop, store {
//         nft: Object<NFT>,
//         bidder: address,
//         bid_amount: u64
//     }

//     #[event]
//     struct AuctionCreatedEvent has drop, store {
//         nft: Object<NFT>,
//         seller: address,
//         start_price : u64,
//         end_time: u64
//     }

//     #[event]
//     struct ContestNFTAssignedEvent has drop, store {
//         nft: Object<NFT>,
//         contest_id: u64
//     }

//     #[event]
//     struct ContestWinnerRewardedEvent has drop, store {
//         winner: address,
//         nft: Object<NFT>,
//         contest_id: u64
//     }

//     #[event]
//     struct DepositEvent has drop, store {
//         user_id: vector<u8>,
//         amount: u64,
//         pool_id: u64
//     }

//     #[event]
//     struct WithdrawalEvent has drop, store {
//         user_id: vector<u8>,
//         amount: u64,
//         pool_id: u64
//     }

//     #[event]
//     struct MomentPurchasedEvent has drop, store {
//         buyer: address,
//         moment_id: u64,
//         amount: u64
//     }

//     #[event]
//     struct AccruedFeesWithdrawnEvent has drop, store {
//         amount: u64,
//         to_address: address
//     }

//     fun generate_uuid(addr: address): vector<u8> {
//         let bytes = bcs::to_bytes(&addr);
//         vector::append(&mut bytes, bcs::to_bytes(&timestamp::now_seconds()));
//         hash::sha3_256(bytes)
//     }

//     fun create_pool_signer(betting_pool: &BettingPoolData): signer {
//             account::create_signer_with_capability(&betting_pool.signer_cap)
//     }

//    // Initialize functions
//     fun init_module(account: &signer) {
//         let (pool_signer, signer_cap) = account::create_resource_account(account, b"BETTING_POOL_SEED");

//         let betting_pool = BettingPoolData {
//             users: table::new(),
//             pool_amounts: table::new(),
//             accrued_fees: 0,
//             commissions_address: signer::address_of(account),
//             commission: 5,
//             signer_cap,
//             nfts: table::new(),
//             auctions: table::new(),
//             quizzes: table::new(),
//             quiz_attempts: table::new(),
//             next_quiz_id: 0
//         };
//         move_to(account, betting_pool);
//     }
    
//     // NFT Creation
//     public entry fun create_nft(
//         creator: &signer,
//         name: String,
//         description: String,
//         video_uri: String
//     ) acquires BettingPoolData {
//         let creator_addr = signer::address_of(creator);
        
//         let constructor_ref = object::create_object(creator_addr);
//         let nft_signer = object::generate_signer(&constructor_ref);

//         let nft = NFT {
//             creator: creator_addr,
//             name,
//             description,
//             video_uri,
//             extend_ref: object::generate_extend_ref(&constructor_ref),
//         };

//         move_to(&nft_signer, nft);
        
//         let nft_obj = object::object_from_constructor_ref(&constructor_ref);
        
//         let betting_pool = borrow_global_mut<BettingPoolData>(@0x1);
//         table::add(&mut betting_pool.nfts, nft_obj, creator_addr);

//         event::emit(NFTCreatedEvent {
//             creator: creator_addr,
//             nft: nft_obj,
//             video_uri
//         });
//     }
//     public entry fun initialize_betting_pool(account: &signer) {
//         let (pool_signer, signer_cap) = account::create_resource_account(account, b"BETTING_POOL_SEED");

//         let betting_pool = BettingPoolData {
//                 users: table::new(),
//             pool_amounts: table::new(),
//             accrued_fees: 0,
//             commissions_address: signer::address_of(account),
//             commission: 5,
//             signer_cap,
//             nfts: table::new(),
//             auctions: table::new(),
//             quizzes: table::new(),
//             quiz_attempts: table::new(),
//             next_quiz_id: 0
//         };
//         move_to(account, betting_pool);
//     }


//     public entry fun create_user(account: &signer) acquires BettingPoolData {
//         let user_addr = signer::address_of(account);
//         let betting_pool = borrow_global_mut<BettingPoolData>(@my_addrx);
        
//         assert!(!table::contains(&betting_pool.users, user_addr), error::already_exists(ERR_USER_ALREADY_EXISTS));

//         let user_id = generate_uuid(user_addr);
//         let user = User {
//             owed_value: 0,
//             uuid: user_id
//         };

//         table::add(&mut betting_pool.users, user_addr, user);

//         event::emit(NewUserEvent {
//             user_id,
//             user_address: user_addr
//         });
//     }

  
//     public entry fun deposit(
//         account: &signer,
//         amount: u64,
//         pool_id: u64
//     ) acquires BettingPoolData {
//         let sender = signer::address_of(account);
//         assert!(amount > 0, error::invalid_argument(ERR_AMOUNT_ZERO));

//         let betting_pool = borrow_global_mut<BettingPoolData>(@my_addrx);
//         assert!(table::contains(&betting_pool.users, sender), error::not_found(ERR_USER_NOT_REGISTERED));

//         // Transfer APT from sender to pool
//         coin::transfer<AptosCoin>(account, @my_addrx, amount);

//         // Calculate commission
//         let after_commission = (amount * (100 - betting_pool.commission)) / 100;
        
//         // Update user's owed value
//         let user = table::borrow_mut(&mut betting_pool.users, sender);
//         user.owed_value = user.owed_value + after_commission;

//         // Update pool amount
//         if (!table::contains(&betting_pool.pool_amounts, pool_id)) {
//             table::add(&mut betting_pool.pool_amounts, pool_id, after_commission);
//         } else {
//             let pool_amount = table::borrow_mut(&mut betting_pool.pool_amounts, pool_id);
//             *pool_amount = *pool_amount + after_commission;
//         };

//         // Update accrued fees
//         betting_pool.accrued_fees = betting_pool.accrued_fees + (amount - after_commission);

//         event::emit(DepositEvent {
//             user_id: user.uuid,
//             amount,
//             pool_id
//         });
//     }

//     public entry fun purchase_moment(
//         account: &signer,
//         moment_id: u64,
//         amount: u64
//     ) acquires BettingPoolData {
//         let sender = signer::address_of(account);
//         let betting_pool = borrow_global_mut<BettingPoolData>(@my_addrx);
        
//         let user = table::borrow_mut(&mut betting_pool.users, sender);
//         assert!(user.owed_value >= amount, error::invalid_argument(ERR_INSUFFICIENT_BALANCE));

//         user.owed_value = user.owed_value - amount;
//         betting_pool.accrued_fees = betting_pool.accrued_fees + amount;

//         event::emit(MomentPurchasedEvent {
//             buyer: sender,
//             moment_id,
//             amount
//         });
//     }

//     public entry fun withdraw(
//         account: &signer,
//         amount: u64,
//         pool_id: u64
//     ) acquires BettingPoolData {
//         let sender = signer::address_of(account);
//         let betting_pool = borrow_global_mut<BettingPoolData>(@my_addrx);
        
//         // Validate and update balances first
//         {
//             // Check user exists and has sufficient balance
//             let user = table::borrow_mut(&mut betting_pool.users, sender);
//             assert!(user.owed_value >= amount, error::invalid_argument(ERR_INSUFFICIENT_BALANCE));
//             user.owed_value = user.owed_value - amount;
//         };

//         {
//             // Check pool has sufficient balance
//             let pool_amount = table::borrow_mut(&mut betting_pool.pool_amounts, pool_id);
//             assert!(*pool_amount >= amount, error::invalid_argument(ERR_INSUFFICIENT_POOL_BALANCE));
//             *pool_amount = *pool_amount - amount;
//         };

//         // After all mutations are done, create the signer and transfer
//         let pool_signer = create_pool_signer(betting_pool);
//         coin::transfer<AptosCoin>(&pool_signer, sender, amount);

//         // Emit event with uuid
//         let user = table::borrow(&betting_pool.users, sender);
//         event::emit(WithdrawalEvent {
//             user_id: user.uuid,
//             amount,
//             pool_id
//         });
//     }

//     public entry fun withdraw_accrued_fees(account: &signer) acquires BettingPoolData {
//         let sender = signer::address_of(account);
//         let betting_pool = borrow_global_mut<BettingPoolData>(@my_addrx);
        
//         assert!(sender == betting_pool.commissions_address, error::permission_denied(ERR_NOT_AUTHORIZED));
//         assert!(betting_pool.accrued_fees > 0, error::invalid_state(ERR_NO_ACCRUED_FEES));

//         let amount = betting_pool.accrued_fees;
//         let pool_signer = create_pool_signer(betting_pool);
//         coin::transfer<AptosCoin>(&pool_signer, betting_pool.commissions_address, amount);
        
//         betting_pool.accrued_fees = 0;
        
//         event::emit(AccruedFeesWithdrawnEvent {
//             amount,
//             to_address: betting_pool.commissions_address
//         });
//     }

//     // Create auction for NFT
// public entry fun create_auction(
//     seller: &signer,
//     nft: Object<NFT>,
//     start_price: u64,
//     duration: u64
// ) acquires BettingPoolData {
//     let seller_addr = signer::address_of(seller);
//     let betting_pool = borrow_global_mut<BettingPoolData>(@my_addrx);
    
//     // Verify ownership
//     assert!(table::contains(&betting_pool.nfts, nft), ERR_NOT_AUTHORIZED);
//     assert!(*table::borrow(&betting_pool.nfts, nft) == seller_addr, ERR_NOT_AUTHORIZED);

//     let constructor_ref = object::create_object(seller_addr);
    
//     let auction = Auction {
//         nft,
//         seller: seller_addr,
//         start_price,
//         end_time: timestamp::now_seconds() + duration,
//         highest_bidder: option::none(),
//         highest_bid: start_price,
//         delete_ref: object::generate_delete_ref(&constructor_ref),
//         extend_ref: object::generate_extend_ref(&constructor_ref),
//     };

//     table::add(&mut betting_pool.auctions, nft, auction);

//     event::emit(AuctionCreatedEvent {
//         nft,
//         seller: seller_addr,
//         start_price,
//         end_time: timestamp::now_seconds() + duration
//     });
// }
// // Quiz Attempt
//     public entry fun attempt_quiz(
//         participant: &signer,
//         quiz_id: u64,
//         answers: vector<String>
//     ) acquires BettingPoolData {
//         let participant_addr = signer::address_of(participant);
//         let betting_pool = borrow_global_mut<BettingPoolData>(@my_addrx);
        
//         assert!(table::contains(&betting_pool.quizzes, quiz_id), ERR_CONTEST_NOT_FOUND);
//         let quiz = table::borrow_mut(&mut betting_pool.quizzes, quiz_id);
//         assert!(quiz.is_active, ERR_QUIZ_NOT_ACTIVE);
//         assert!(vector::length(&answers) == 5, ERR_INVALID_ANSWERS);

//         // Initialize attempt tracking if needed
//         if (!table::contains(&betting_pool.quiz_attempts, participant_addr)) {
//             table::add(&mut betting_pool.quiz_attempts, participant_addr, table::new());
//         };
        
//         let user_attempts = table::borrow_mut(&mut betting_pool.quiz_attempts, participant_addr);
//         assert!(!table::contains(user_attempts, quiz_id), ERR_QUIZ_ALREADY_ATTEMPTED);

//         // Calculate score
//         let score = 0;
//         let i = 0;
//         while (i < 5) {
//             if (*vector::borrow(&answers, i) == vector::borrow(&quiz.questions, i).correct_answer) {
//                 score = score + 1;
//             };
//             i = i + 1;
//         };

//         // Record attempt
//         table::add(user_attempts, quiz_id, score);

//         // Award NFT if perfect score
//         let won_nft = score == quiz.required_score;
//         if (won_nft) {
//             let nft = quiz.nft;
//             table::remove(&mut betting_pool.nfts, nft);
//             table::add(&mut betting_pool.nfts, nft, participant_addr);
//             quiz.is_active = false;
//         };

//         event::emit(QuizAttemptedEvent {
//             participant: participant_addr,
//             quiz_id,
//             score,
//             won_nft
//         });
//     }

//     // View Functions
//     #[view]
//     public fun get_active_quizzes(): vector<Object<NFT>> acquires BettingPoolData {
//         let betting_pool = borrow_global<BettingPoolData>(@my_addrx);
//         let result = vector::empty<Object<NFT>>();
        
//         let quiz_id = 0;
//         while (quiz_id < betting_pool.next_quiz_id) {
//             if (table::contains(&betting_pool.quizzes, quiz_id)) {
//                 let quiz = table::borrow(&betting_pool.quizzes, quiz_id);
//                 if (quiz.is_active) {
//                     vector::push_back(&mut result, quiz.nft);
//                 };
//             };
//             quiz_id = quiz_id + 1;
//         };
//         result
//     }

//     #[view]
//     public fun get_quiz_details(quiz_id: u64): (address, vector<String>, bool) acquires BettingPoolData {
//         let betting_pool = borrow_global<BettingPoolData>(@my_addrx);
//         assert!(table::contains(&betting_pool.quizzes, quiz_id), ERR_CONTEST_NOT_FOUND);
        
//         let quiz = table::borrow(&betting_pool.quizzes, quiz_id);
//         let questions = vector::empty();
        
//         let i = 0;
//         while (i < vector::length(&quiz.questions)) {
//             vector::push_back(&mut questions, vector::borrow(&quiz.questions, i).question);
//             i = i + 1;
//         };
        
//         (quiz.creator, questions, quiz.is_active)
//     }

//     #[view]
//     public fun get_user_quiz_scores(participant: address): vector<u64> acquires BettingPoolData {
//         let betting_pool = borrow_global<BettingPoolData>(@my_addrx);
//         let result = vector::empty<u64>();
        
//         if (table::contains(&betting_pool.quiz_attempts, participant)) {
//             let user_attempts = table::borrow(&betting_pool.quiz_attempts, participant);
//             let quiz_id = 0;
//             while (quiz_id < betting_pool.next_quiz_id) {
//                 if (table::contains(user_attempts, quiz_id)) {
//                     vector::push_back(&mut result, *table::borrow(user_attempts, quiz_id));
//                 };
//                 quiz_id = quiz_id + 1;
//             };
//         };
//         result
//     }

//     #[view]
//     public fun get_user_nfts(user_address: address): vector<Object<NFT>> acquires BettingPoolData {
//         let betting_pool = borrow_global<BettingPoolData>(@my_addrx);
//         let result = vector::empty<Object<NFT>>();
        
//         let nfts = &betting_pool.nfts;
//         let keys = table::keys(nfts);
//         let i = 0;
//         while (i < vector::length(&keys)) {
//             let nft = *vector::borrow(&keys, i);
//             let owner = table::borrow(nfts, nft);
//             if (*owner == user_address) {
//                 vector::push_back(&mut result, nft);
//             }
//             i = i + 1;
//         }
        
//         result
//     }

//     #[view]
//     public fun get_nft_details(nft: Object<NFT>): (address, String, String, String) acquires NFT {
//         let nft_data = borrow_global<NFT>(object::object_address(&nft));
//         (nft_data.creator, nft_data.name, nft_data.description, nft_data.video_uri)
//     }

//     #[view]
//     public fun get_user(user_address: address): (u64, vector<u8>) acquires BettingPoolData {
//         let betting_pool = borrow_global<BettingPoolData>(@my_addrx);

//         let user = table::borrow(&betting_pool.users, user_address);
//         (user.owed_value, user.uuid)
//     }

//     #[view]
//     public fun get_pool_amount(pool_id: u64): u64 acquires BettingPoolData {
//         let betting_pool = borrow_global<BettingPoolData>(@my_addrx);
//         if (table::contains(&betting_pool.pool_amounts, pool_id)) {
//             *table::borrow(&betting_pool.pool_amounts, pool_id)
//         } else {
//             0
//         }
//     }

//     #[view]
//     public fun get_accrued_fees(): u64 acquires BettingPoolData {
//         let betting_pool = borrow_global<BettingPoolData>(@my_addrx);
//         betting_pool.accrued_fees
//     }
// }