export const bedCount = 6

export const printUserName = true

export const introText = true

function createDate(year, month, day, hour, minute) {
	return new Date(year, month - 1, day, hour - 1, minute)
}

export const exhibitEndTime = createDate(2023, 11, 15, 15)
