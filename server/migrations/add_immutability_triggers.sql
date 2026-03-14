-- Migration: Add Immutability Triggers to DNA_HISTORY
-- Description: Prevents any UPDATE or DELETE operations on the audit ledger.

USE dna_trace;

-- 1. Trigger to prevent UPDATE
DROP TRIGGER IF EXISTS trg_prevent_update_dna_history;
DELIMITER //
CREATE TRIGGER trg_prevent_update_dna_history
BEFORE UPDATE ON DNA_HISTORY
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = 'Immutability Violation: Mutation history records cannot be modified.';
END;
//
DELIMITER ;

-- 2. Trigger to prevent DELETE
DROP TRIGGER IF EXISTS trg_prevent_delete_dna_history;
DELIMITER //
CREATE TRIGGER trg_prevent_delete_dna_history
BEFORE DELETE ON DNA_HISTORY
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = 'Immutability Violation: Mutation history records cannot be deleted.';
END;
//
DELIMITER ;
