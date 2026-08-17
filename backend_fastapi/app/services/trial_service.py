from loguru import logger

class TrialService:
    async def send_trial_expiry_warnings(self, db):
        logger.info("Trial scheduler stub: send_trial_expiry_warnings skipped.")

    async def process_expired_trials(self, db):
        logger.info("Trial scheduler stub: process_expired_trials skipped.")

    async def send_paywall_emails(self, db):
        logger.info("Trial scheduler stub: send_paywall_emails skipped.")

trial_service = TrialService()
