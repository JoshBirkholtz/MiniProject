/**
 * Groups users into age brackets and returns the count for each age group
 * Age groups: 18-24, 25-34, 35-44, 45+
 */
const calculateAgeGroups = (users) => {
    const groups = {
        '18-24': 0,
        '25-34': 0,
        '35-44': 0,
        '45+': 0
    };
    
    users.forEach(user => {
        if (user.age <= 24) groups['18-24']++;
        else if (user.age <= 34) groups['25-34']++;
        else if (user.age <= 44) groups['35-44']++;
        else groups['45+']++;
    });
    
    return groups;
};

/**
 * Calculates the distribution of users by gender
 * Returns an object with gender as key and count as value
 */
const calculateGenderDistribution = (users) => {
    return users.reduce((acc, user) => {
        acc[user.gender] = (acc[user.gender] || 0) + 1;
        return acc;
    }, {});
};

/**
 * Calculates the distribution of users' budget preferences
 * Returns an object with budget range as key and count as value
 */
const calculateBudgetPreferences = (users) => {
    return users.reduce((acc, user) => {
        acc[user.budgetPreference] = (acc[user.budgetPreference] || 0) + 1;
        return acc;
    }, {});
};

/**
 * Tallies the number of users interested in each event category
 * Returns an object with category as key and interested user count as value
 */
const calculateEventCategories = (users) => {
    const categories = {};
    users.forEach(user => {
        user.eventCategories?.forEach(category => {
            categories[category] = (categories[category] || 0) + 1;
        });
    });
    return categories;
};

/**
 * Processes event ratings to calculate statistics including:
 * - Average rating
 * - Average recommendation score
 * - Distribution of ratings and recommendations
 * - User comments with associated metadata
 */
const calculateRatingStats = (ratings) => {
    const ratingDistribution = {};
    const recommendationDistribution = {};
    let ratingSum = 0;
    let recommendationSum = 0;
    
    ratings.forEach(rating => {
        ratingDistribution[rating.rating] = (ratingDistribution[rating.rating] || 0) + 1;
        ratingSum += rating.rating;

        recommendationDistribution[rating.recommendation] = (recommendationDistribution[rating.recommendation] || 0) + 1;
        recommendationSum += rating.recommendation;

    });

    return {
        average: ratings.length ? ratingSum / ratings.length : 0,
        recommendation: ratings.length ? recommendationSum / ratings.length : 0,
        ratingDistribution,
        recommendationDistribution,
        comments: ratings.map(r => ({
            rating: r.rating,
            text: r.comment,
            userId: r.userId,
            userName: r.userName
        }))
    };
};

/**
 * Combines demographic calculations for event attendees
 * Returns age groups, gender distribution, and budget preferences
 */
const calculateAttendeeDemographics = (attendees) => {
    return {
        ageGroups: calculateAgeGroups(attendees),
        genderDistribution: calculateGenderDistribution(attendees),
        budgetPreferences: calculateBudgetPreferences(attendees)
    };
};

module.exports = {
    calculateAgeGroups,
    calculateGenderDistribution,
    calculateBudgetPreferences,
    calculateEventCategories,
    calculateRatingStats,
    calculateAttendeeDemographics
};