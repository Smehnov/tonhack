<template>
  <main class="dark:bg-gray-800 font-mono bg-white relative overflow-hidden">
    <div class="flex relative z-20 items-center">
      <div class="container mx-auto px-6 flex flex-col justify-between items-center relative py-4">
        <div class="flex flex-col">
          <div class="my-8">
            <p class="text-3xl mb-6 text-center dark:text-white">
              Modern way to interact with cyber physical systems
            </p>
            <h2 class="max-w-3xl text-5xl md:text-6xl font-bold mx-auto dark:text-white text-gray-800 text-center py-2">
              Pay real world devices for their work in TON
            </h2>
          </div>
          <!--          <div class="border-2 border-blue-500 p-4">-->
          <!--            <p class="text-xl my-6 text-center dark:text-white">-->
          <!--              Your account info-->
          <!--            </p>-->
          <!--            <AccountChooser />-->
          <!--          </div>-->

          <div class="border-2 border-blue-500 p-4 mt-8">
            <p class="text-xl my-6 text-center dark:text-white">
              Interact with device
            </p>
            <CpsControl />
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script>

</script>
