import { useState } from 'react';
import { Rating, Textarea, Button, Stack, Text, Modal } from '@mantine/core';

function RatingModal({ isOpen, onClose, eventId, onSubmit, initialRating = null }) {
    const [rating, setRating] = useState(initialRating?.rating || 0);
    const [recommendation, setRecommendation] = useState(initialRating?.rating || 0);
    const [comment, setComment] = useState(initialRating?.comment || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await onSubmit(rating, recommendation, comment);
            // Clear form if it's a new rating
            if (!initialRating) {
                setRating(0);
                setRecommendation(0);
                setComment('');
            }
            onClose(); // Close modal after successful submission
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal 
            opened={isOpen} 
            onClose={onClose}
            title="Rate this Event"
            size="md"
            centered
        >
            <form onSubmit={handleSubmit}>
                <Stack>
                    <Text size="sm" fw={500}>Your Rating</Text>
                    <Rating
                        value={rating}
                        onChange={setRating}
                        size="lg"
                    />
                    <Text size="sm" fw={500}>Would you recommend this to others?</Text>
                    <Rating
                        value={recommendation}
                        onChange={setRecommendation}
                        size="lg"
                    />
                    
                    <Textarea
                        placeholder="Share your experience..."
                        label="Comment"
                        value={comment}
                        onChange={(e) => setComment(e.currentTarget.value)}
                        minRows={3}
                    />
                    {error && (
                        <Text color="red" size="sm">
                            {error}
                        </Text>
                    )}
                    <Button 
                        type="submit" 
                        loading={loading}
                        disabled={rating === 0}
                        fullWidth
                    >
                        Submit Rating
                    </Button>
                </Stack>
            </form>
        </Modal>
    );
}

export default RatingModal;