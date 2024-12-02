module my_addrx::Dunkverse {
    use std::error;
    use std::signer;
    use std::vector;
    use std::string::String;
    use aptos_framework::object::{Self, Object, ExtendRef};
    use aptos_framework::event;
    use aptos_std::table::{Self, Table};
    use std::option::{Self, Option};

    // Error codes
    const ERR_NOT_AUTHORIZED: u64 = 1;
    const ERR_QUIZ_NOT_FOUND: u64 = 2;
    const ERR_QUIZ_ALREADY_COMPLETED: u64 = 3;
    const ERR_INSUFFICIENT_SCORE: u64 = 4;
    const ERR_QUIZ_NOT_ACTIVE: u64 = 5;

    // Structs
    struct NFT has key {
        creator: address,
        ipfs_url: String,
        extend_ref: ExtendRef,
    }

    struct Question has store, drop {
        question_text: String,
        correct_answer: String
    }

    struct Quiz has key, store {
        nft: Object<NFT>,
        creator: address,
        questions: vector<Question>,
        is_active: bool,
        required_score: u64,
        passing_score: u64
    }

    struct QuizStorage has key {
        quizzes: Table<Object<NFT>, Quiz>,
        quiz_attempts: Table<address, Table<Object<NFT>, bool>>,
        nft_owners: Table<Object<NFT>, address>
    }

    // Events
    #[event]
    struct NFTCreatedEvent has drop, store {
        creator: address,
        nft: Object<NFT>,
        ipfs_url: String
    }

    #[event]
    struct QuizCreatedEvent has drop, store {
        creator: address,
        nft: Object<NFT>,
        question_count: u64
    }

    #[event]
    struct QuizCompletedEvent has drop, store {
        participant: address,
        nft: Object<NFT>,
        score: u64,
        passed: bool
    }

    // Initialize function
    fun init_module(account: &signer) {
        let quiz_storage = QuizStorage {
            quizzes: table::new(),
            quiz_attempts: table::new(),
            nft_owners: table::new()
        };
        move_to(account, quiz_storage);
    }

    // Create NFT with IPFS URL
    public entry fun create_nft(
        creator: &signer,
        ipfs_url: String
    ) acquires QuizStorage {
        let creator_addr = signer::address_of(creator);
        
        // Create NFT object
        let constructor_ref = object::create_object(creator_addr);
        let nft_signer = object::generate_signer(&constructor_ref);

        let nft = NFT {
            creator: creator_addr,
            ipfs_url,
            extend_ref: object::generate_extend_ref(&constructor_ref),
        };

        move_to(&nft_signer, nft);
        
        let nft_obj = object::object_from_constructor_ref(&constructor_ref);
        
        // Store NFT ownership
        let quiz_storage = borrow_global_mut<QuizStorage>(@my_addrx);
        table::add(&mut quiz_storage.nft_owners, nft_obj, creator_addr);

        // Emit event
        event::emit(NFTCreatedEvent {
            creator: creator_addr,
            nft: nft_obj,
            ipfs_url
        });
    }

    // Create quiz for an NFT
    public entry fun create_quiz(
        creator: &signer,
        nft: Object<NFT>,
        questions: vector<String>,
        answers: vector<String>
    ) acquires QuizStorage {
        let creator_addr = signer::address_of(creator);
        let quiz_storage = borrow_global_mut<QuizStorage>(@my_addrx);
        
        // Verify creator owns the NFT
        assert!(
            table::contains(&quiz_storage.nft_owners, nft) && 
            *table::borrow(&quiz_storage.nft_owners, nft) == creator_addr,
            error::permission_denied(ERR_NOT_AUTHORIZED)
        );

        // Create quiz questions
        let quiz_questions = vector::empty<Question>();
        let i = 0;
        while (i < vector::length(&questions)) {
            let question = Question {
                question_text: *vector::borrow(&questions, i),
                correct_answer: *vector::borrow(&answers, i)
            };
            vector::push_back(&mut quiz_questions, question);
            i = i + 1;
        };

        // Create and store quiz
        let quiz = Quiz {
            nft,
            creator: creator_addr,
            questions: quiz_questions,
            is_active: true,
            required_score: vector::length(&questions), // Must answer all correctly
            passing_score: vector::length(&questions)
        };

        table::add(&mut quiz_storage.quizzes, nft, quiz);

        // Emit event
        event::emit(QuizCreatedEvent {
            creator: creator_addr,
            nft,
            question_count: vector::length(&questions)
        });
    }

   public entry fun take_quiz(
    participant: &signer,
    nft: Object<NFT>,
    answers: vector<String>
) acquires QuizStorage {
    let participant_addr = signer::address_of(participant);
    let quiz_storage = borrow_global_mut<QuizStorage>(@my_addrx);
    
    // Verify quiz exists and is active
    assert!(table::contains(&quiz_storage.quizzes, nft), error::not_found(ERR_QUIZ_NOT_FOUND));
    let quiz = table::borrow(&quiz_storage.quizzes, nft);
    assert!(quiz.is_active, error::invalid_state(ERR_QUIZ_NOT_ACTIVE));

    // Check if participant already attempted
    if (!table::contains(&quiz_storage.quiz_attempts, participant_addr)) {
        table::add(&mut quiz_storage.quiz_attempts, participant_addr, table::new());
    };
    let participant_attempts = table::borrow_mut(&mut quiz_storage.quiz_attempts, participant_addr);
    assert!(!table::contains(participant_attempts, nft), error::invalid_state(ERR_QUIZ_ALREADY_COMPLETED));

    // Grade quiz
    let score = 0u64;
    let i = 0;
    let quiz_questions = &quiz.questions;
    while (i < vector::length(&answers)) {
        if (*vector::borrow(&answers, i) == vector::borrow(quiz_questions, i).correct_answer) {
            score = score + 1;
        };
        i = i + 1;
    };

    // Check if passed
    let passed = score >= quiz.passing_score;
    if (passed) {
        // Transfer NFT ownership (drop the mutable reference before this operation)
        table::remove(&mut quiz_storage.nft_owners, nft);
        table::add(&mut quiz_storage.nft_owners, nft, participant_addr);
    };

    // Record attempt
    table::add(participant_attempts, nft, passed);

    // Emit completion event
    event::emit(QuizCompletedEvent {
        participant: participant_addr,
        nft,
        score,
        passed
    });
}

    // Get quiz details
    #[view]
    public fun get_quiz_details(nft: Object<NFT>): (address, vector<String>, bool, u64) acquires QuizStorage {
        let quiz_storage = borrow_global<QuizStorage>(@my_addrx);
        let quiz = table::borrow(&quiz_storage.quizzes, nft);
        
        let questions = vector::empty<String>();
        let i = 0;
        while (i < vector::length(&quiz.questions)) {
            vector::push_back(&mut questions, vector::borrow(&quiz.questions, i).question_text);
            i = i + 1;
        };

        (quiz.creator, questions, quiz.is_active, quiz.required_score)
    }
}