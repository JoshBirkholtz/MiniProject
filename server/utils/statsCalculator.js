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

const calculateGenderDistribution = (users) => {
    return users.reduce((acc, user) => {
        acc[user.gender] = (acc[user.gender] || 0) + 1;
        return acc;
    }, {});
};

const calculateBudgetPreferences = (users) => {
    return users.reduce((acc, user) => {
        acc[user.budgetPreference] = (acc[user.budgetPreference] || 0) + 1;
        return acc;
    }, {});
};

const calculateEventCategories = (users) => {
    const categories = {};
    users.forEach(user => {
        user.eventCategories?.forEach(category => {
            categories[category] = (categories[category] || 0) + 1;
        });
    });
    return categories;
};

const calculateRatingStats = (ratings) => {
    const distribution = {};
    let sum = 0;
    
    ratings.forEach(rating => {
        distribution[rating.rating] = (distribution[rating.rating] || 0) + 1;
        sum += rating.rating;
    });

    return {
        average: ratings.length ? sum / ratings.length : 0,
        distribution,
        comments: ratings.map(r => ({
            rating: r.rating,
            text: r.comment
        }))
    };
};

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