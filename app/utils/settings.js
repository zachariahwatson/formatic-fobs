export const bedCount = 4

export const printUserName = false

export const introText = false

function createDate(year, month, day, hour, minute) {
	return new Date(year, month - 1, day, hour - 1, minute)
}

export const exhibitEndTime = createDate(2023, 9, 23, 21)
